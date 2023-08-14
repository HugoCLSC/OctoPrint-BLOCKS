# coding=utf-8
import os
import io
import re
import socket
import shlex
import subprocess
import logging
from .python3wifi.iwlibs import Wireless, getWNICnames, getNICnames, Iwscan

# logging.basicConfig(filename="/home/pi/logs/wifisep.log", level=logging.DEBUG,
#                     format='%(asctime)s %(levelname)s %(name)s %(message)s',)


class Wifisetup(object):

    def __init__(self):
        self._psk = None
        self._ssid = None
        self._interfaces = []
        self._wifi = None
        self._os_name = self.run_command(
            'cat /etc/os-release | grep "NAME=" ').decode(encoding="UTF-8")
        # print("OS_NAME" + self._os_name)
        self.logger = logging.getLogger(__name__)

    def set_wifi_info(self, _ssid=None, _psk=None):
        """Setter for the ssid and password variables.

        Args:
            _ssid (type): ssid of the network. Defaults to None.
            _psk (type): password of the network. Defaults to None.

        Returns:
            None, if any of the arguments is None.

        """
        if _ssid is None or _psk is None:
            return None
        self._ssid = _ssid
        self._psk = _psk

    def select_wifi(self, _id=None):
        """Select a wifi network with a given id.
            Run the select_network command from wpa_cli
            on the wlan0 interface (wifi)

        Args:
            _id (type): id of the network to select. Defaults to None.

        Returns:
            type: The output of the command

        """
        if _id is None:
            return None
        if "Raspbian" in self._os_name:
            _output = self.run_command(
                "wpa_cli -i wlan0 select_network %s" % _id)
            _output = self.run_command("nmcli con ")
            return _output.decode("UTF-8")

    def set_wifi_ssid_psk(self):
        """Adds a new network to the system and saves the new configuration.
            This is done by running some shell commands.

        Returns:
            type: boolean, True if it waas successful at adding the network False
                otherwise.

        """
        if "Raspbian" in self._os_name:
            _output = self.run_command("wpa_cli -i wlan0 add_network")
            _network_id = _output.decode(encoding="UTF-8")
            self.run_command(
                'wpa_cli -i wlan0 set_network %s ssid "%s" ' % (_network_id, self._ssid))
            self.run_command(
                'wpa_cli -i wlan0 set_network %s psk "%s" ' % (_network_id, self._psk))
            self.run_command(
                "wpa_cli -i wlan0 enable_network %s" % (_network_id))
            _pass = self.set_pass_encryp(
                _id=_network_id, _ssid=self._ssid, _password=self._psk)
            _returnSave = self.run_command("wpa_cli -i wlan0 save config")

            return True if "OK" in _returnSave.decode(encoding="UTF-8") else False
        elif "Debian" in self._os_name:
            _output = self.run_command(
                'nmcli dev wifi connect %s password "%s" ' % (self._ssid, self._psk)).decode(encoding="UTF-8")
            if "\'wlan0\'successfully activated " in _output:
                self.run_command("echo %s " % _output)
                _output = self.run_command(
                    "nmcli con up %s" % self._ssid
                ).decode(encoding="UTF-8")

            return True if "Connection successfully activated" in _output else False

    def set_pass_encryp(self, _id=None, _ssid=None, _password=None):
        """Runs shell command to get the encryption for a network password.
            Using the wpa_passphrase command.
        Args:
            _id (type): if of the network. Defaults to None.
            _ssid (type): ssid for the network. Defaults to None.
            _password (type): password of the network(not encrypted). Defaults to None.

        Returns:
            type: String, the encrypted password

        """
        if "Raspbian" not in self._os_name:
            return ""

        _regex = re.compile(r"psk=(...+)\n}$")
        _output = self.run_command("wpa_passphrase %s %s" % (_ssid, _password))
        _output_decoded = _output.decode(encoding="UTF-8").rstrip()
        _encrypted_pass = re.findall(_regex, _output_decoded)
        self.run_command("wpa_cli -i wlan0 set_network %s psk %s " %
                         (_id, _encrypted_pass[0]))
        return _encrypted_pass

    def list_existing_networks(self):
        """Get a list with all the already configured networks on the device.
            # ! (NOT WORKING)
        Returns:
            type: List. A list with all configured networks.

        """
        _output = self.run_command("wpa_cli -i wlan0 list_networks")
        return _output.decode(encoding="UTF-8").split("\n")

    def list_available_networks(self):
        """Requests a BSS scan and resturns a list with all the SSID from that scan.

        Returns:
            type: List. A list with all the SSID found.

        """
        _network_scan_regex = re.compile(r"]\t(...+)\n")
        _network = []
        self.run_command("wpa_cli -i wlan0 scan")
        _output = self.run_command("wpa_cli -i wlan0 scan_results")
        # I have here the entire scan that was made for the networks
        _output_decoded = _output.decode(encoding="UTF-8").rstrip()
        _network = re.findall(_network_scan_regex, _output_decoded)
        return _network

    def _wifi_strength_calc(self, signalLevel):
        """Calculate the wifi signal strenght.
            value = 4 ---> there is no connection
            value =[5,8] ----> strenght of the signal
            value = 9 ----> We are using ethernet cable

        Args:
            signalLevel (type): integer. The signal level for the current network.

        Returns:
            type: integer. The wifi strenght.

        """
        _level = 0
        if signalLevel is None or signalLevel <= 10:
            _level = 4
        elif signalLevel > 10 and signalLevel <= 25:
            _level = 5
        elif signalLevel > 25 and signalLevel <= 50:
            _level = 6
        elif signalLevel > 50 and signalLevel <= 85:
            _level = 7
        elif signalLevel > 85 and signalLevel <= 100:
            _level = 8
        return _level

    def interfaces(self):
        # if "Raspbian" in self._os_name:
        #     self._interfaces = []
        #     self._interfaces.append(getWNICnames())
        #     print(self._interfaces)
        # elif "Debian" in self._os_name:
        self._interfaces = []
        self._interfaces.extend(getWNICnames())

        return self._interfaces

    def find_connection(self):
        """Tries to find a connection to a given interface.
            If there is a connection available returns the respective
            interface and _ssid.
            It also saves the handler for that connection in self._wifi

        Returns:
            type: touple with (<interface_name>,<ssid>)

        Raises:
            ExceptionName: Exception. Failed to test the interface.

        """
        self.interfaces()

        for _interface in self._interfaces:
            if _interface is not None:
                try:
                    self._wifi = Wireless(_interface)
                    if "Raspbian" in self._os_name:
                        _ssid = self._wifi.getEssid()
                    elif "Debian" in self._os_name:
                        _ssid = self.run_command(
                            "nmcli -t -f NAME connection show --active").decode(encoding="UTF-8").strip()

                    if _ssid:
                        # Means there is a _ssid available
                        # We can assume there is internet
                        return (_interface, _ssid)
                except Exception as e:
                    pass

    def get_connection_stats(self, _stats=None):
        """Get the network statistics for the current active network connection.

        Args:
            _stats (type: dict): A dictionary. Defaults to None.

        Returns:
            type: dict. Returns the dict with the wanted stats.

        """
        if _stats["Interface"] is None:
            return None

        if "Raspbian" in self._os_name:
            _, quality, _, _ = self._wifi.getStatistics()
            _stats["Quality"] = quality.quality
            _stats["Signal"] = quality.siglevel
            _stats["WifiLevel"] = self._wifi_strength_calc(
                signalLevel=_stats["Quality"])
        elif "Debian" in self._os_name:
            _wifiStrength = self.run_command(
                "nmcli -f IN-USE,SIGNAL,SSID device wifi | awk \'/^\*/{if (NR!=1) {print $2}}\'").decode(encoding="UTF-8").strip()
            _stats["WifiLevel"] = self._wifi_strength_calc(
                signalLevel=int(_wifiStrength))

        return _stats

    HOSTS_FILE_PATH = "/etc/hosts"
    HOSTNAME_FILE_PATH = "/etc/hostname"
    HOST_LINE_PREFIX = '127.0.1.1 '

    def hostnameChange(self, newHostname):
        """
        Changes the hostname in the /etc/hosts file and on the hostnamectl

        Arguments:
            String - The new hostname to be set to
        """
        if newHostname is None or not isinstance(newHostname, str):
            return

        # @ Change the hostname with hostnamectl first
        try:
            _response = self.run_command(
                f"sudo hostnamectl set-hostname {newHostname.strip()}")
            self.logger.info(
                f"Hostname Change command, Response : {_response}")
        except IOError as error:
            self.logger.error(
                f"Failed to update /etc/hostname, error: {error}")

        # @ Change the hostname in the /etc/hosts file
        _newFile = []
        try:
            with io.open(self.HOSTS_FILE_PATH, "r+", encoding="utf-8") as _fileHandle:
                _lines = _fileHandle.readlines()
                _newFile = [line.replace(line[10:], newHostname+"\n")
                            if self.HOST_LINE_PREFIX in line else line for line in _lines]
                _fileHandle.seek(0)
                _fileHandle.write(
                    ''.join(_newFile)
                )
        except IOError as error:
            self.logger.error(
                f"Failed to update /etc/hosts file, error: {error}")

        self.run_command("sudo reboot")

        return

    def getMachineHostname(self):
        try:
            return socket.gethostname()
        except subprocess.SubprocessError as error:
            self.logger.error(f"Failed to run commad {error}")

    def run_command(self, command):
        """Runs a shell command.

        Args:
            command (type: string): The command to be executed .

        Returns:
            type: The complete output that resulted from the command.

        """
        try:
            # * Old way, it didn't let me use grep commands or use | on the command
            # cmd = shlex.split(command,posix=False)
            # exec = cmd[0]
            # exec_options = cmd[1:]
            # output = subprocess.run(
            #     ([exec] + exec_options), capture_output=True)
            p = subprocess.Popen(
                command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            output, e = p.communicate()
            return output
        except subprocess.SubprocessError:
            self.logger.error('Error running commas : %s', command)
