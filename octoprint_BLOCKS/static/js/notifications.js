/*,
 * View model for Notifications used in the Blocks Plugin
 *
 * Author: Hugo C. Lopes Santos Costa
 * License: AGPLv3
 */
$(function () {
    function NotificationsViewModel(parameters){
        var self = this;


        self.loginState = parameters[0];
        self.access = parameters[1];
        self.settings = parameters[2];

        self.blocksNotifications = ko.observableArray([]);



      // This function will automatically listen for any messages any plugin sends.
        self.onDataUpdaterPluginMessage = function (plugin, data) {
          if (plugin != "BLOCKS")
            return;

          self.blocksNotifications.push(data);

          if(data.action =="popup"){
            new PNotify({
                title: gettext("Printer Notification"),
                text: data.text,
                type: data.type,
                hide: true,
                icon: "fa fa-bell-o",
                buttons: {
                    sticker: false,
                    closer: false
                }
            });
          }
      };
  }
  OCTOPRINT_VIEWMODELS.push({
    construct: NotificationsViewModel,
    dependencies: ["loginStateViewModel", "accessViewModel", "settingsViewModel"],
    elements: ["#blocks_notifications_wrapper"] // Preciso de colocar aqui os meus elementos do template
  });

});
