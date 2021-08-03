/*,
 * View model for Notifications used in the Blocks Plugin
 *
 * Author: Hugo C. Lopes Santos Costa
 * License: AGPLv3
 */


 // TODO: I really need to save the array length when the system is disabled i think

$(function () {
    function NotificationsViewModel(parameters){
        var self = this;


        self.loginState = parameters[0];
        self.access = parameters[1];
        self.settings = parameters[2];

        self.blocksNotifications = ko.observableArray([]);

        ko.onError = function(error) {

            console.log("knockout error", error);
        };


      // This function will automatically listen for any messages any plugin sends.
      self.onDataUpdaterPluginMessage = function (plugin, data) {

        try {
          if (plugin != "BLOCKS")
            return;

          console.log(self.blocksNotifications().length);

          // To put data on the vector i need to place those two brackets right next to the observableArray
          // This is the javascript way, the Knockoutjs those brackets are not meant to be there

          // self.blocksNotifications().push(data);

          self.blocksNotifications.push(data);

          console.log(self.blocksNotifications().length);
          if(data.action =="popup"){
            new PNotify({
                title: gettext("Printer Notification"),
                text: data.message,
                type: data.type,
                hide: true,
                icon: "fa fa-bell-o",
                buttons: {
                    sticker: false,
                    closer: true
                }
            });
          }

        } catch (e) {
          ko.onError(e);
        }


      };

      self.clearNotifications = function (){

      };

  }
  // Ver qual é a diferença entre o OCTOPRINT_VIEWMODELS e o ADDITIONAL_VIEWMODELS
  OCTOPRINT_VIEWMODELS.push({
    construct: NotificationsViewModel,
    dependencies: ["loginStateViewModel", "accessViewModel", "settingsViewModel"],
    elements: ["#blocks_notifications_wrapper"] // Preciso de colocar aqui os meus elementos do template
  });

});
