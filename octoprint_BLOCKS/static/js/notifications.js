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

            console.log("knockout error", error);
        };

        self.onEventConnecting = function() {
          $('.blocks_notifications_entry').removeClass('fadeOutLeft').addClass('slide-right');
        };
        self.onEventDisconnecting = function(){
          $('.blocks_notifications_entry').addClass('fadeOutLeft').removeClass('slide-right');
          self.clearNotifications();
        };
        self.getTime = ko.pureComputed (function(){
          // Just a normal function to get me the time
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
            ko.onError(exception);
          }
        };
        // Filter my notifications i do not want copies while i get warnings
        self._filter = function(data){
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
            ko.onError(e);
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
            ko.onError(exception);
          }
        };
  }
  OCTOPRINT_VIEWMODELS.push({
    construct: NotificationsViewModel,
    dependencies: ["loginStateViewModel", "accessViewModel", "settingsViewModel"],
    elements: ["#blocks_notifications_wrapper"]
  });
});
