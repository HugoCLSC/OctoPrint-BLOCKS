# coding=utf-8
from __future__ import absolute_import

### (Don't forget to remove me)
# This is a basic skeleton for your plugin's __init__.py. You probably want to adjust the class name of your plugin
# as well as the plugin mixins it's subclassing from. This is really just a basic skeleton to get you started,
# defining your plugin as a template plugin, settings and asset plugin. Feel free to add or remove mixins
# as necessary.
#
# Take a look at the documentation on what other plugin mixins are available.

import octoprint.plugin
import octoprint.settings
import octoprint.util
import octoprint.environment
import os
import sys
import flask


from flask import send_file
from flask import url_for

class BlocksPlugin(octoprint.plugin.SettingsPlugin,
                octoprint.plugin.UiPlugin,
                octoprint.plugin.AssetPlugin,
                octoprint.plugin.TemplatePlugin,
                octoprint.plugin.StartupPlugin):

    def on_after_startup(self):
        self._logger.info("Blocks theme initialized...")


    ##~~ SettingsPlugin mixin

        ##Plugins including the mixing will get injected an additional property
        ##self._settings which is an instance of PluginSettingsManager already properly
        ##initialized for use by the plugin. In order for the manager to know about the
        ##available settings structure and default values upon initialization,
        ##implementing plugins will need to provide a dictionary with the plugin’s
        ##default settings through overriding the method get_settings_defaults().
        ##The defined structure will then be available to access through the
        ##settings manager available as self._settings.

    def get_settings_defaults(self):
        return {
            # put your plugin's default settings here

            "fluidLayout" : True,

            "fixedHeader" : True,

            "blocksFooterInfo" : True,

            "removeCollapsible" : True

        }


    ##Vou precisar de adicionar as definições de on_settings_save e ainda
    ##on_after_startup para salvar as definições que tenhamos


    ##~~ AssetPlugin mixi

        ##Allows me to define additional static assets such as JavaScript or class
        ##files to be automatically embedded into the pages delivered by the server
        ##to be used within the client sided part of the plugin

    def get_assets(self):
        # Define your plugin's asset(the folder) files to automatically include in the
        # core UI here.

        ##Defines the folder where the plugin stores its static assets
        ##as defined in
        #~Return string: the absolute path to the folder where the plugin
        ##stores its static assets

        return dict(
            js= ["js/BLOCKS.js","js/jqyery-ui.min.js"],
            img= ["img/Blocks_Logo.png","img/settings.png"],
            css= ["css/BLOCKS.css","css/jquery-ui.css"],
            less= ["less/BLOCKS.less"]
        )

    ##~~ TemplatePlugin mixin

        ##This mixin enables me to inject my own components into the OctoPrint
        ##web interface.

    def get_template_configs(self):
        ##Allow configuration of injected navbar,sidebar,tab and settings
        ##templates(and also additional templates of types specified by plugins
        ##through hte octoprint.ui.web.templateytpes hook).
        ##Basically i can allows me to configure Should be a list containing one
        ##configuration object per template to inject. Each configuration object
        ##is represented by a dictionary which may contain the following keys:
            ##type|name|template|suffix|div |replaces|custom_bindings|data_bind|
            ##classes|styles

        return[
            dict(type="settings", custom_bindings=False)
        ]

    ##~~ Softwareupdate hook

    def get_update_information(self):
        # Define the configuration for your plugin to use with the Software Update
        # Plugin here. See https://docs.octoprint.org/en/master/bundledplugins/softwareupdate.html
        # for details.
        return dict(
            BLOCKS= dict(
                displayName= "Blocks Plugin",
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


# If you want your plugin to be registered within OctoPrint under a different name than what you defined in setup.py
# ("OctoPrint-PluginSkeleton"), you may define that here. Same goes for the other metadata derived from setup.py that
# can be overwritten via __plugin_xyz__ control properties. See the documentation for that.
__plugin_name__ = "Blocks Plugin"
__plugin_pythoncompat__ = ">=2.7,<4"
# Starting with OctoPrint 1.4.0 OctoPrint will also support to run under Python 3 in addition to the deprecated
# Python 2. New plugins should make sure to run under both versions for now. Uncomment one of the following
# compatibility flags according to what Python versions your plugin supports!
#__plugin_pythoncompat__ = ">=2.7,<3" # only python 2
#__plugin_pythoncompat__ = ">=3,<4" # only python 3
#__plugin_pythoncompat__ = ">=2.7,<4" # python 2 and 3

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = BlocksPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information,
        #"octoprint.ui.web.templatetypes":__plugin_implementation__.add_templatetype
    }
