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



      // This function will automatically listen for any messages any plugin sends.
      self.onDataUpdaterPluginMessage = function (plugin, data) {
          if (plugin != "BLOCKS")
            return;



          // In here i should make the notifications appear on the notification wrapper
          // It's not really doing that i do not know why
          // It always displays an error abou the observableArray blocksNotifications
          // saying it's not defined. Need to check into that

          // The line directly below pushes the message to the container
          // But after that it make an error appear.
          // self.blocksNotifications.push(data);

          // debugger;
          // console.log("YOOO i'm here my man");

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

      self.response = function (response){
        var notifications = response.blocksNotifications;
        self.blocksNotifications(notifications);
      };

  }
  // Ver qual é a diferença entre o OCTOPRINT_VIEWMODELS e o ADDITIONAL_VIEWMODELS
  OCTOPRINT_VIEWMODELS.push({
    construct: NotificationsViewModel,
    dependencies: ["loginStateViewModel", "accessViewModel", "settingsViewModel"],
    elements: ["#blocks_notifications_wrapper"] // Preciso de colocar aqui os meus elementos do template
  });

});
