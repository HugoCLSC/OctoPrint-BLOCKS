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
    self.loginState = parameters[1];
    self.control = parameters[2];
    self.access = parameters[3];


    self.webcamTab = ko.observable(undefined);
    self.webcamTab.subscribe(function(clicked){
      if(clicked){
        // self.control._enableWebcam();

        clearTimeout(self.control.webcamDisableTimeout);
        $("#webcam_image").attr("src","http://192.168.1.94/webcam/?action=stream");
        // self.control.webcamLoaded(true);

        // Determine stream type and switch to corresponding webcam.
        // Took from controlViewModel.
        var streamType = determineWebcamStreamType(self.settings.webcam_streamUrl());
        if (streamType == "mjpg") {
            self.control._switchToMjpgWebcam();
        } else if (streamType == "hls") {
            self.control._switchToHlsWebcam();
        } else {
            throw "Unknown stream type " + streamType;
        }
      }else if(!clicked){
        // self.control._disableWebcam();
        var timeout = self.settings.webcam_streamTimeout() || 5;
        self.control.webcamDisableTimeout = setTimeout(function () {
            log.debug("Unloading webcam stream");
            $("#webcam_image").attr("src", "");
            self.control.webcamLoaded(false);
        }, timeout * 1000);
      }
    });
    self.onBrowserTabVisibilityChange = function (status) {
        if (status) {
          // self.control._enableWebcam();

          clearTimeout(self.control.webcamDisableTimeout);
          $("#webcam_image").attr("src","http://192.168.1.94/webcam/?action=stream");
          // self.control.webcamLoaded(true);

          // Determine stream type and switch to corresponding webcam.
          // Took from controlViewModel.
          var streamType = determineWebcamStreamType(self.settings.webcam_streamUrl());
          if (streamType == "mjpg") {
              self.control._switchToMjpgWebcam();
          } else if (streamType == "hls") {
              self.control._switchToHlsWebcam();
          } else {
              throw "Unknown stream type " + streamType;
          }
        } else {
          // self.control._disableWebcam();
          var timeout = self.settings.webcam_streamTimeout() || 5;
          self.control.webcamDisableTimeout = setTimeout(function () {
              log.debug("Unloading webcam stream");
              $("#webcam_image").attr("src", "");
              self.control.webcamLoaded(false);
          }, timeout * 1000);
        }
    };
    // self.onTabChange = function (current, previous){
    //   if(current == "#webCam"){
    //     self.control._enableWebcam();
    //   }else if (previous == "#webCam"){
    //     self.control._disableWebcam();
    //   }
    // };
  }
  OCTOPRINT_VIEWMODELS.push({
    construct: BLOCKS_WebCamViewModel,
    dependencies: [
      "settingsViewModel",
      "loginStateViewModel",
      "controlViewModel",
      "accessViewModel"],
    elements: [
      "#webcam_link"]
  });
});
