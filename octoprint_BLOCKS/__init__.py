# coding=utf-8
from __future__ import absolute_import

import time
import flask
import octoprint.plugin
import octoprint.events
import octoprint.plugin.core

from octoprint.access import ADMIN_GROUP
from octoprint.access.permissions import Permissions
from octoprint.events import Events
from flask import Flask, render_template, url_for




class BlocksPlugin(octoprint.plugin.SettingsPlugin,
                   octoprint.plugin.UiPlugin,
                   octoprint.plugin.AssetPlugin,
                   octoprint.plugin.TemplatePlugin,
                   octoprint.plugin.StartupPlugin,
                   octoprint.plugin.SimpleApiPlugin,
                   octoprint.plugin.ProgressPlugin,
                   octoprint.plugin.EventHandlerPlugin,):

    def on_after_startup(self):
        self._logger.info("Blocks initializing...")

    ##~~ AssetPlugin mixi

    def get_assets(self):
        # Define your plugin's asset(the folder) files to automatically include in the
        # core UI here.
        return dict(
            js=["js/BLOCKS.js", "js/jquery-ui.min.js", "js/notifications.js"],
            css=["css/BLOCKS.css", "css/jquery-ui.css","css/animations.css"],
            less=["less/BLOCKS.less"]
        )

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            # For Light and Dark Theme
            "themeType": False
        }

    def on_settings_initialized(self):
        # Get the saved settings
        theme = self._settings.get(["themeType"])
        self._settings.set(["themeType"], theme)
        self._logger.info("theme = {}".format(theme))

    def on_settings_save(self, data):
        # save settings 
        octoprint.plugin.SettingsPlugin.on_settings_save(self, data)
        theme = self._settings.get(["themeType"])
        if 'themeType' in data and data['themeType']:
            self._settings.set(["themeType"], theme)
            self.logger.info("Saving settings.")

    ##~~ TemplatePlugin mixin

        ##This mixin enables me to inject my own components into the OctoPrint
        ##web interface.

    def get_template_configs(self):

        return[
            dict(type="settings", custom_bindings=False),
            # Permite-me adicionar o meu novo container para a connection mas não sei se devo utilizar este type
            # ou criar meu próprio type de template...
            dict(type="sidebar", template="blocks_connectionWrapper.jinja2", custom_bindings=False),
            # My webcam link
            dict(type="generic", template="webcam_tab.jinja2", custom_bindings=False),
            # Fan slider
            dict(type="generic", template="fanSlider.jinja2", custom_bindings=False),
            # Custom Notifications
            dict(type="generic", template="blocks_notifications_wrapper.jinja2", custom_bindings=False),
            # For Load Unload functions on the control section
            dict(type="generic", template="Load_Unload.jinja2", custom_bindings=False),
            # Light Dark Theme Switch
            dict(type="generic", template="lightDarkSwitch.jinja2", custom_bindings=False),
        ]

    ##~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
        # for details.
        return dict(
            BLOCKS= dict(
                displayName= self._plugin_name,
                displayVersion= self._plugin_version,

                # version check: github repository
                type= "github_release",
                user= "HugoCLSC",
                repo= "BLOCKSUI",
                current= self._plugin_version,

                # update method: pip
                pip= "https://github.com/HugoCLSC/BLOCKSUI/archive/{target_version}.zip",
            )
        )

    ## ~~ EventHandlerPlugin mixin

    def on_event(self, event, payload):
        try:
            # Everytime an event takes place we will send a message to any message listeners that exist
            if event == Events.CONNECTED:
                notification = {
                    "action": "popup",
                    "type": "info",
                    "hide": "true",
                    "message": event,
                }
                self._plugin_manager.send_plugin_message(self._identifier, notification)

            if event == Events.DISCONNECTED:
                notification = {
                    "action": "popup",
                    "type": "info",
                    "hide": "true",
                    "message": event,
                }
                self._plugin_manager.send_plugin_message(self._identifier, notification)

            self._logger.info("Notification : {}".format(event))
        except Exception as e:
            self._logger.info(e)




    ## ~~ ProgressPlugin mixin

    def on_print_progress(self, storage, path, progress):

        if progress >= 25:
            notification = {
                "action": "popup",
                "type": "warning",
                "hide": "true",
                "message": "25"
            }
            # Sends a message to any message listeners
            self._plugin_manager.send_plugin_message(self._identifier, notification)

        self._logger.info("Print Progress: {}".format(progress))


    def sent_m600(self, comm_instance, phase, cmd, cmd_type, gcode, *args, **kwargs):
        try:
            # Everytime i send the commands M701 and M702 this function will trigger
            # Possible because of the hook "octoprint.comm.protocol.gcode.sent"
            # M701 'Load Filament'
            # M702 'Unload Filament'
            if gcode and "M600" in gcode:
                notification = {
                    "action": "popup",
                    "type": "warning",
                    "hide": "false",
                    "message": "Filament Change in Progress. Follow the printer instructions"
                }
                self._plugin_manager.send_plugin_message(self._identifier, notification)
                self._logger.info("Notifications: Gcode sent {}".format("gcode"))
        except Exception as e:
            self._logger.info(e);


    def detect_machine_type(self, comm, line, *args, **kwargs):
        try:
            from octoprint.util.comm import parse_firmware_line

            printer_data = parse_firmware_line(line)
            if "MACHINE_TYPE" not in line:
                # self._logger.info(line)
                return line

            self._logger.info(line)

            notification = {
                "type": "machine_info",
                "message": format(machine=printer_data["MACHINE_TYPE"])
            }
            self._plugin_manager.send_plugin_message(self._identifier, notification)
        except Exception as e:
            self._logger.info(e)


    # Detect filament runout
    # GCode command: M412
    # This command than proceeds to execute the M600 to execute the filament change.
    def detect_filament_runout(self, comm, line, *args, **kwargs):
        try:
            from octoprint.util.comm import parse_firmware_line
            if "M412" not in line:
                return line

            printer_data = parse_firmware_line(line)

            notification = {
                "action": "popup",
                "type": "machine_info",
                "message": "Filament Runout, Change Filament to proceed",
                "hide": "false",
            }
            self._plugin_manager.send_plugin_message(self._identifier, notification)
        except Exception as e:
            self._logger.info(e)




__plugin_name__ = "Blocks Plugin"
__plugin_pythoncompat__ = ">=2.7,<4"



def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = BlocksPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information,
        "octoprint.comm.protocol.gcode.received": __plugin_implementation__.detect_machine_type,
        "octoprint.comm.protocol.gcode.received": __plugin_implementation__.detect_filament_runout,
        "octoprint.comm.protocol.gcode.sent": __plugin_implementation__.sent_m600,
    }
