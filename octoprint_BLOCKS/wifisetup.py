# coding=utf-8

import os
import io
import threading

class Wifisetup(object):
    # These are both of the path locations where i can setup the wifi of the pi
    _pathSys = "/etc/wpa_supplicant/wpa_supplicant.conf"
    _pathOcto = "/boot/octopi-wpa-supplicant.txt"

    def __init__(self):

        self._fileHandle = None
        self._psk = None
        self._ssid = None

        self._file_lock = threading.RLock()


    def _openFile(self, filepath):
        with self._file_lock:
            try:
                self._fileHandle = FileOperations.__init__(self, filepath)

                self._fileHandle.openFile()
            except io.IOError:
                # TODO: Log the exception
                pass
            except FileNotFoundError:
                pass
            except: # Other errors
                pass

    def _closeFile(self):
        with self._file_lock:
            try:
                self._fileHandle.closeFile()
            except io.IOError:
                # TODO: log exception
                pass

    def set_wifi_info(self, _ssid = None, _psk = None):
        if _ssid is None or _psk is None:
            return None

        self._ssid = _ssid
        self._psk = _psk


    def set_new_wifi_connection(self):

        _line = """network={
           	ssid=\"%s\"
            psk=\"%s\"
            }"""%(self._ssid, self._psk)
        try:
            # First the system supplicant
            self._openFile(filepath = _pathSys)
            self._fileHandle.write_line(line = _line)
            self._closeFile()

        except:
            # TODO: log exception
            pass

class FileOperations(object):

    def __init__(self, filename):

        self._logger = logging.getLogger(__name__)

        self._file_handle = None
        self._file_name = filename
        self._file_size = os.stat(self.file_name).st_size
        self._file_pos = 0
        self._read_lines = 0

        if not os.path.exists(self._file_name) or not os.path.isfile(self._file_name):
            raise IOError("File %s does not exist" % self._file_name)


    def openFile(self, mode="a", encoding="utf-8", newline=None):
        """
            Opens the file and then sets the file handle and the file position

            the mode is "a" because it appends to the end of the file
        """
        if "b" in mode:
            with io.open(self._file_name, mode=mode, newline = newline) as self._file_handle:
                # The tell() gets me the file position
                self._file_pos = self._file_handle.tell()
        elif "b" not in mode:
            with io.open(self._file_name, mode= mode, encoding= "utf-8", newline= newline) as self._file_handle:
                # The tell() gets me the file position
                self._file_pos = self._file_handle.tell()

        return io.open(self._file_name, mode="a")

    def closeFile(self):
        """
            Closes the file
        """
        self._file_handle.close()
        # Reset the file handle
        self._file_handle = None


    def read_line(self):
        """
            Returns:
                - The line with the command
                - The line number on the file
        """
        if self._file_handle is None:
            return None
        line = self._file_handle.readline()
        self._file_pos = self._file_handle.tell()
        self._read_lines += 1

        return line

    def write_line(self, line):
        if self._file_handle is None:
            return None

        self._file_handle.write(line)

        return line

    @property
    def file_size(self):
        """
            Returns the file size
        """
        return self._file_size

    @property
    def file_handle(self):
        """
            Gets the file handle and returns it
        """
        return self._file_handle

    @property
    def file_pos(self):
        """
            Returns the file position
        """
        return self._file_pos

    @file_pos.setter
    def file_pos(self, value):
        """
            Setter for file position
            when given a position, it goes there
        """
        self._file_handle.seek(value)
        self._file_pos = self._file_handle.tell()
