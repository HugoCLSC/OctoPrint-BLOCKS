



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

    //
    // self.isErrorOrClosed = ko.observable(undefined);
    // self.isOperational = ko.observable(undefined);
    // self.isPaused = ko.observable(undefined);
    // self.isPrinting = ko.observable(undefined);
    // self.isError = ko.observable(undefined);
    // self.isReady = ko.observable(undefined);
    // self.isLoading = ko.observable(undefined);
    // // Callback, called when current printer status data is received from the server with the data as single parameter.
    // self.fromCurrentData = function (data){
    //
    // };
    // self._processData = function (data){
    //   self.isErrorOrClosed(data.flags.closedOrError);
    //   self.isOperational(data.flags.operational);
    //   self.isPaused(data.flags.paused);
    //   self.isPrinting(data.flags.printing);
    // };

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
