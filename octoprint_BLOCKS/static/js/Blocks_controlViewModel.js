/*,
 * View model for Notifications used in the Blocks Plugin
 *
 * Author: Hugo C. Lopes Santos Costa
 * License: AGPLv3
 */


$(function(){
  function Blocks_controlViewModel(parameters){
    var self = this;

    self.debug = true;
    self.settings = parameters[0];
    self.connection = parameters[1];
    self.oprint_control = parameters[2];
    self.temperature = parameters[3];
    self.printerState = parameters[4];
    // Debugger
    self.logToConsole = function (msg){
      if(!self.debug){
        return true;
      }
      if (typeof console.log == "function"){
        console.log("BLOCKS control model: ",msg);
      }
    };

    // Probably not even using this anywhere.
    self.distances = ko.observableArray([0.1, 1, 10, 100]);
    self.distance = ko.observable(0.1);

    self.buttonActive = ko.pureComputed(function(){
        // indicates if the buttons can be used or not
        if (self.connection.isOperational() && !self.connection.isPrinting() ){
          return true;
        }else{
          return false;
        };
    });

    self.xLeft = function(){
      self.control.sendJogCommand("x", -1, self.distance())
    };
    self.xRight = function(){
      self.control.sendJogCommand("x", 1, self.distance())
    };
    self.yUp = function(){
      self.control.sendJogCommand("y", 1, self.distance())
    };
    self.yDown = function(){
      self.control.sendJogCommand("y", -1, self.distance())
    };
    self.zUp = function(){
      self.control.sendJogCommand("z", 1, self.distance())
    };
    self.zDown = function(){
      self.control.sendJogCommand("z", -1, self.distance())
    };

    self.home = function () {
      self.control.sendHomeCommand(["x","y","z"]);
    };

    self.updateDistance =
  };
  OCTOPRINT_VIEWMODELS.push({
    construct : Blocks_controlViewModel,
    dependencies: [
      "settingsViewModel",
      "connectionViewModel",
      "controlViewModel",
      "temperatureViewModel",
      "printerStateViewModel"
    ],
    elements : []
  });
});
