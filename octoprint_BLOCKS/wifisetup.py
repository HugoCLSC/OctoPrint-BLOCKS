# coding=utf-8

import os
import io
import re
import shlex
import codecs
import threading
import subprocess
from .python3wifi.iwlibs import Wireless, getWNICnames, getNICnames, Iwscan

class Wifisetup(object):

    def __init__(self):
        self._psk = None
        self._ssid = None
        self._interfaces = []
        self._wifi = None

    def set_wifi_info(self, _ssid = None, _psk = None):
        if _ssid is None or _psk is None:
            return None
        self._ssid = _ssid
        self._psk = _psk

    def select_wifi(self, _id=None):
        if _id is None:
            return None
        _output = self.run_command("wpa_cli -i wlan0 select_network %s" % _id)
        return _output.decode("UTF-8")

    def set_wifi_ssid_psk(self):
        """
            Adds a new network to the pi and saves the confifuration
        """
        _output = self.run_command("wpa_cli -i wlan0 add_network")
        _network_id = _output.decode(encoding="UTF-8")
        self.run_command("wpa_cli -i wlan0 set_network %s ssid \'\"%s\"\' " % (_network_id, self._ssid))
        self.run_command("wpa_cli -i wlan0 set_network %s psk \'\"%s\"\' " % (_network_id, self._psk))
        self.run_command("wpa_cli -i wlan0 enable_network %s" % (_network_id))
        self.set_pass_encryp(_id = _network_id, _ssid = self._ssid, _password = self._psk)
        _returnSave = self.run_command("wpa_cli -i wlan0 save config")
        if "OK" in _returnSave.decode(encoding="UTF-8"):
            return True
        return False

    def set_pass_encryp(self, _id = None, _ssid = None, _password = None):
        """
            For a given _ssid and _password
            Return a encrypted key for that password
        """
        _regex = re.compile(r"psk=(...+)\n}$")

        _output = self.run_command("wpa_passphrase %s %s" %(_ssid, _password))
        _output_decoded = _output.decode(encoding="UTF-8").rstrip()
        _encrypted_pass = re.findall(_regex, _output_decoded)
        self.run_command("wpa_cli -i wlan0 set_network %s psk %s " % (_id, _encrypted_pass[0]))


    def list_existing_networks(self):
        """
            Gets the already added networks
            Returns a list with all the already configured networks on the device
        """
        _output = self.run_command("wpa_cli -i wlan0 list_networks")
        return _output.decode(encoding="UTF-8").split("\n")

    def list_available_networks(self):
        """
            Gets a list with all the networks available for connection
            Returns that list
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
        """
            Given a signalLevel Returns a wifi strength level to send to the printer.
                value = 4 ---> there is no connection
                value =[5,8] ----> strenght of the signal
                value = 9 ----> We are using ethernet cable
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

    @property
    def interfaces(self):
        self._interfaces = []
        self._interfaces.append(getWNICnames())
        return self._interfaces

    def find_connection(self, _stats = None):
        """
            Tries to find a connection to a given interface.
            If there is a connection available returns the respective
                interface and _ssid.
            it also saves the handler for that connection in self._wifi
        """
        self.interfaces()
        for _interface in self._interfaces:
            if _interface is not None:
                try:
                    self._wifi = Wireless(_interface)
                    _ssid = self._wifi.getEssid()

                    if _ssid:
                        # Means there is a _ssid available
                        # We can assume there is internet
                        return (_interface, _ssid)
                except Exception:
                    self._logger.info("Unexpected Error while finding a wifi connection.")

    def get_connection_stats(self, _stats = None):
        """
            Argument is a dictionary with a interface and a ssid
            Get the connection stats for a given connection in self._wifi
            Update the given dictionary with the quality and signal level for
            that connection
            Also adds to the dictionary the calculated wifi level
        """
        if _stats["Interface"] is None:
            return None

        _, quality, _, _ = self._wifi.getStatistics()
        _stats["Quality"] = quality.quality
        _stats["Signal"] = quality.siglevel
        _stats["WifiLevel"] = self._wifi_strength_calc(signalLevel = _stats["Quality"])

        return _stats

    def run_command(self, command):
        """
            Runs a command on the pi terminal
            Returns the output of that command
        """
        cmd = shlex.split(command)
        exec = cmd[0]
        exec_options = cmd[1:]

        try:
            output = subprocess.run(([exec] + exec_options), capture_output = True)
            output_line = output.stdout

            return output_line

        except:
            # TODO ahdnle the exception
            pass
