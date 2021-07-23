/*
 * View model for BLOCKS_WebCam
 *
 * Author: Hugo C. Lopes dos Santos Costa
 * License: APGLv3
 */


$(function() {

  function BLOCKS_WebCamViewModel(parameters) {
    var self = this;

    self.settings = parameters[0];
    self.control = parameters[1];


    self.onAllBound = function() {

    }
    self.onTabChange = function (current, previous){
      if(current == "#webCam"){
        self.control._enableWebcam();
      }else if (previous == "#webCam"){
        self.control._disableWebcam();
      }
    }
  }
  OCTOPRINT_VIEWMODELS.push({
    construct: BLOCKS_WebCamViewModel,
    dependencies: [
      "settingsViewModel",
      "loginStateViewModel",
      "controlViewModel"],
    elements: [
      "#blockControlWrapper"]
  });
});
