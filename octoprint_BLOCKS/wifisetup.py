# coding=utf-8

import os
import io
import threading
from configparser import ConfigParser
import subprocess
import shlex
import codecs

class Wifisetup(object):

    def __init__(self):

        self._psk = None
        self._ssid = None
        self._config_handle = ConfigParser()

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
            Adds a new network and configures the network
        """
        _output = self.run_command("wpa_cli -i wlan0 add_network")
        _network_id = _output.decode(encoding="UTF-8")
        _returnSSID = self.run_command("wpa_cli -i wlan0 set_network %s ssid \'\"%s\"\' " % (_network_id, self._ssid))
        _returnPSK = self.run_command("wpa_cli -i wlan0 set_network %s psk \'\"%s\"\' " % (_network_id, self._psk))
        self.run_command("wpa_cli -i wlan0 enable_network %s" % (_network_id))
        _returnSave = self.run_command("wpa_cli -i wlan0 save config")
        if "OK" in _returnSave.decode(encoding="UTF-8"):
            return True
        return False

    def list_existing_networks(self):

        _output = self.run_command("wpa_cli -i wlan0 list_networks")
        return _output.decode(encoding="UTF-8").split("\n")


    def run_command(self, command):
        # Runs a shell command and returns the response if any
        cmd = shlex.split(command)
        exec = cmd[0]
        exec_options = cmd[1:]

        try:
            output = subprocess.run(([exec] + exec_options), capture_output = True)
            output_line = output.stdout

            return output_line

        except:
            pass
