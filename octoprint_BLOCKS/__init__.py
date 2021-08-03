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





class BlocksPlugin(octoprint.plugin.SettingsPlugin,
                   octoprint.plugin.UiPlugin,
                   octoprint.plugin.AssetPlugin,
                   octoprint.plugin.TemplatePlugin,
                   octoprint.plugin.StartupPlugin,
                   octoprint.plugin.SimpleApiPlugin,
                   octoprint.plugin.ProgressPlugin,
                   octoprint.plugin.EventHandlerPlugin,):



    def __init__(self):
        self._blocksNotifications = []

    def on_after_startup(self):
        self._logger.info("Blocks theme initialized...")

    ##~~ AssetPlugin mixi

    def get_assets(self):
        # Define your plugin's asset(the folder) files to automatically include in the
        # core UI here.
        return dict(
            js= ["js/BLOCKS.js", "js/jquery-ui.min.js", "js/notifications.js"],
            img= ["img/Blocks_Logo.png", "img/settings.png"],
            css= ["css/BLOCKS.css", "css/jquery-ui.css"],
            less= ["less/BLOCKS.less"]
        )

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            # put your plugin's default settings here

            "fluidLayout" : True,

            "fixedHeader" : True,

            #"fixedFooter" : True,

            "blocksFooterInfo" : True,

            "removeCollapsible" : True


        }

    ##~~ TemplatePlugin mixin

        ##This mixin enables me to inject my own components into the OctoPrint
        ##web interface.

    def get_template_configs(self):

        return[

            dict(type="settings", custom_bindings=False),
            # Permite-me adicionar o meu novo container para a connection mas não sei se devo utilizar este type
            # ou criar meu próprio type de template...
            dict(type="sidebar", template="blocks_connectionWrapper.jinja2", custom_bindings=False),
            # My refresh button for my connection wrapper
            dict(type="generic", template="refreshButton.jinja2", custom_bindings=False),
            # My webcam link
            dict(type="generic", template="webcam_tab.jinja2", custom_bindings=False),
            # Fan slider
            dict(type="generic", template="fanSlider.jinja2", custom_bindings=False),
            # Custom Notifications
            dict(type="generic", template="blocks_notifications_wrapper.jinja2", custom_bindings=False)
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
    # ~ SimpleApiPlugin

    def on_api_get(self, request):
        return flask.jsonify(
            blocksNotifications=[
                {"timestamp": blocksNotification[0], "message": blocksNotification[1]}
                for blocksNotification in self._blocksNotifications
            ]
        )

    def get_api_commands(self):
        return {"clear": []}

    def on_api_command(self, command, data):
        if command == "clear":
            self._clear_notifications()


    ## ~~ EventHandlerPlugin mixin

    def on_event(self, event, payload):
        # Everytime an event takes place we will send a message to any message listeners that exist
        if event == Events.CONNECTED:
            Notification = {
                "action": "popup",
                "type": "info",
                "message": event,
            }
            self._blocksNotifications.append((time.time(), Notification))
            self._plugin_manager.send_plugin_message(self._identifier, Notification)
        # Case event when printer disconnects 
        if event == Events.DISCONNECTED:
            self._clear_notifications()

        self._logger.info("Notification : {}".format(event))


    def _clear_notifications(self):
        self._blocksNotifications = []
        self._plugin_manager.send_plugin_message(self._identifier, {})
        self._logger.info("Notifications Cleared.")


    ## ~~ ProgressPlugin mixin

    def on_print_progress(storage, path, progress):
        if progress == 25:
            # The message i want to display
            message = dict(
                # Still do not know what type of action i should place in here
                action = "notification",
                type = "info",
                text = "Printing progress at {}%".format(progress)
            )
            # Adds the message to the Notifications
            self._notification.append(time.time(), message)
            # Sends a message to any message listeners
            self._plugin_manager.send_plugin_message(plugin._identifier, {"message": message})


__plugin_name__ = "Blocks Plugin"
__plugin_pythoncompat__ = ">=2.7,<4"



def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = BlocksPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information,

    }
