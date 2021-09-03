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
        clearTimeout(self.control.webcamDisableTimeout);
        $("#webcam_image").attr("src","http://192.168.1.94/webcam/?action=stream");
        // self.control.webcamLoaded(true);

        // Determine stream type and switch to corresponding webcam.
        // Took from the controlViewModel.
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
          clearTimeout(self.control.webcamDisableTimeout);
          $("#webcam_image").attr("src","http://192.168.1.94/webcam/?action=stream");
          // Determine stream type and switch to corresponding webcam.
          // Took from the controlViewModel.
          var streamType = determineWebcamStreamType(self.settings.webcam_streamUrl());
          if (streamType == "mjpg") {
              self.control._switchToMjpgWebcam();
          } else if (streamType == "hls") {
              self.control._switchToHlsWebcam();
          } else {
              throw "Unknown stream type " + streamType;
          }
        }
    };


    self.fullScreenStyles = {
      "ON":{
        "width": "",
        "height": "",
        "z-index": "1070",
        "position": "fixed",
        "display": "block",
        "top": "0px",
        "bottom": "0px",
        "right": "0px",
        "left": "0px",
      },
      "OFF":{
        "width": "100%",
        "height": "100%",
        "z-index": "unset",
        "position": "relative",
        "display": "",
        "top": "unset",
        "bottom": "unset",
        "right": "unset",
        "left": "unset",
      }
    };

    self.fullScreenState = ko.observable(false);
    self.fullScreenButton = ko.observable(undefined);
    self.fullScreenButton.subscribe(function(val){
      try {
        if(self.fullScreenState() === false){
          self.fullScreenOperations(true);
          self.fullScreenState(true);

        }else if (self.fullScreenState() === true ){
          self.fullScreenState(false);
          self.fullScreenOperations(false);
        }
      } catch (e) {
        console.log(e);
      }
    });

    self.fullScreenOperations = function(state){
      if(state === true){
        self.fullScreenStyles.ON.height = document.documentElement.clientHeight;
        self.fullScreenStyles.ON.width = document.documentElement.clientWidth;

        var iH = $(window).height();
        var iW = $(window).width();
        var aH = screen.availHeight;
        var aW = screen.availWidth;
        // const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        // const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        // self.fullScreenStyles.ON.height = vw;
        // self.fullScreenStyles.ON.width = vh;
        console.log(aH,aW);
        console.log(iH, iW);
        console.log(self.fullScreenStyles.ON.height);
        console.log(self.fullScreenStyles.ON.width);
        $('#webcam_container').css(self.fullScreenStyles.ON);
        // $('#webcam_image').css(self.fullScreenStyles.ON);
        // $('#webcam_rotator').css(self.fullScreenStyles.ON);
      }else{
        $('#webcam_container').css(self.fullScreenStyles.OFF);
        // $('#webcam_image').css(self.fullScreenStyles.OFF);
        // $('#webcam_rotator').css(self.fullScreenStyles.OFF);
      }
    };

    // This event listener serves for the full screen video player
    // When the user presses Escape when the video is full screen
    var bod = document.querySelector('html');
    bod.addEventListener('keydown', (e) => {

        if((e.key ==="Escape" || e.key === 'Esc') && self.fullScreenState()===true ){
          console.log(e);
          self.fullScreenState(false);
          self.fullScreenOperations(false);
        }
    });

  }
  OCTOPRINT_VIEWMODELS.push({
    construct: BLOCKS_WebCamViewModel,
    dependencies: [
      "settingsViewModel",
      "loginStateViewModel",
      "controlViewModel",
      "accessViewModel"],
    elements: [
      "#webcam_link",
      "#goFullScreen"]
  });
});
