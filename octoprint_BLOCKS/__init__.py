# coding=utf-8
from __future__ import absolute_import


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
                   octoprint.plugin.EventHandlerPlugin):

    def on_after_startup(self):
        self._logger.info("Blocks theme initialized...")

    ##~~ AssetPlugin mixi

    def get_assets(self):
        # Define your plugin's asset(the folder) files to automatically include in the
        # core UI here.
        return dict(
            js= ["js/BLOCKS.js", "js/jquery-ui.min.js"],
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
            dict(type="generic", template="fanSlider.jinja2", custom_bindings=False)
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

    def on_event(self, event, payload):
        # Everytime an event takes place we will send a message to any message listeners that exist 
        self._plugin_manager.send_plugin_message(self._identifier, dict(action="popup", type="info", text= event))

        self._logger.info("Notification : {}".format(event))


    """
    def custom_action_handler(self, comm, line, action, *args, **kwargs):
        if not  action == "notification":
            return

    ## TODO make more notifications for when the printer is conecting disconnecting etc

        self._logger.info("blebleble")
        r = os.system("//action_custom notification Helllll")

    """


__plugin_name__ = "Blocks Plugin"
__plugin_pythoncompat__ = ">=2.7,<4"



def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = BlocksPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
