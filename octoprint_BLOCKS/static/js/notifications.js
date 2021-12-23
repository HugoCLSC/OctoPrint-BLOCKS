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

        ko.onError = function(error) {
            console.log("KnockoutJS error:", error);
        };

        self.onStartupComplete = function() {
          var msg = {
            "action" : "popup",
            "type": "autoconnect",
            "message": "Attempting automatic connection to the printer.",
            "hide":"false"
          };
          self._PopUpNotification(msg);
        };

        self.onEventConnecting = function() {
          $('.blocks_notifications_entry').removeClass('fadeOutLeft').addClass('slide-right');
        };
        self.onEventDisconnecting = function(){
          $('.blocks_notifications_entry').addClass('fadeOutLeft').removeClass('slide-right');
          self.clearNotifications();
        };
        self.onEventError = function(error){
          // Notifies the user if autoconnect wasn't Successfull.
          if (error.reason == "autodetect" ){
            var msg = {
              "type": "error",
              "message": "Failed automatic connection to the printer.",
            };
            self._PopUpNotification(msg);

          };
        };
        self.getTime = ko.pureComputed (function(){
          var date = new Date();
          var hh = date.getHours();
          var mm = date.getMinutes();
          var sec = date.getSeconds();
          var time = hh + ':' + mm + ':' + sec;
          return gettext(time);
        });

        // This function will automatically listen for any messages any plugin sends.
        self.onDataUpdaterPluginMessage = function (plugin, data) {
          try {
            if (data.type == "WifiSetUp"){
              return;
            }
            if(data.type == "machine_info"){
                console.log(data.message);
            }
            if(data.message == "Print Failed"){
              self._PopUpNotification(data);
            }else if(data.message != "Disconnected" && data.message != "Print Failed"){
              self._filter(data);
            }else{
              self.clearNotifications();
              self._PopUpNotification(data);
            }
          } catch (exception) {
            ko.onError("Error on notification received" + exception);
          }
        };
        // Filter my notifications i do not want copies while i get warnings
        self._filter = function(data){
          if(data.message == Event.DISCONNECTED){
            return;
          }
          try {
            var flag = false;
            ko.utils.arrayForEach(self.blocksNotifications(), function(blocksNotification) {
              if (blocksNotification.message == data.message){
                flag = true;
                return;
              }
            }, self);
            if (flag == false){
              self.blocksNotifications.push(data);
              self._PopUpNotification(data);
            }
            return;
          }catch (e) {
            ko.onError("Error on filtering notifications" + e);
          }
        };
        // Lets me display a PopUp on the page about the notification
        self._PopUpNotification = function (data){
          try {
              new PNotify({
                  title: gettext(" Notification "),
                  text: data.message,
                  type: data.type,
                  hide: data.hide,
                  icon: "fa fa-bell-o",
                  buttons: {
                      sticker: false,
                      closer: true
                  }
              });
          } catch (e) {
            ko.onError(e);
          }
        };
        self.clearNotifications = function (){
          try {
            $('.blocks_notifications_entry').removeClass('slide-right').addClass('fadeOutLeft');
            var animation = document.querySelector(".fadeOutLeft");
            animation.addEventListener('webkitAnimationEnd', () => {
              self.blocksNotifications.removeAll();
              console.log("Notifications Cleared");
            });
          } catch (exception) {
            ko.onError("Clear notifications error" + exception);
          }
        };
  }
  OCTOPRINT_VIEWMODELS.push({
    construct: NotificationsViewModel,
    dependencies: ["loginStateViewModel", "accessViewModel", "settingsViewModel"],
    elements: ["#blocks_notifications_wrapper"]
  });
});
