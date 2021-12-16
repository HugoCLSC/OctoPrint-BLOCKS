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



    self.webcamStatus = ko.observable(false);

    self.onTabChange = function(current, previous){
      if(current == "#tab_plugin_BLOCKS"){
        clearTimeout(self.control.webcamDisableTimeout);
        self.webcamStatus(true);
        $('#tab_plugin_BLOCKS_link > a').attr('class','blink');
        $('#tab_plugin_BLOCKS_link > a').css("color","#f56161ed");
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
      }else{
        self.webcamStatus(false);
        $('#tab_plugin_BLOCKS_link > a').attr('class','');
        $('#tab_plugin_BLOCKS_link > a').css("color","");
      }
    };


    self.onBrowserTabVisibilityChange = function (status) {
        if (status) {
          clearTimeout(self.control.webcamDisableTimeout);
          self.webcamStatus(true);
          var streamType = determineWebcamStreamType(self.settings.webcam_streamUrl());
          if (streamType == "mjpg") {
              self.control._switchToMjpgWebcam();
          } else if (streamType == "hls") {
              self.control._switchToHlsWebcam();
          } else {
              self.webcamStatus(false);
              throw "Unknown stream type " + streamType;
          }
        }
    };


    self.fullScreenStyles = {
      "ON":{
        "width": "100%",
        "height": "100%",
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
      },
      "ROTATOR_ON":{
        "height": "calc(100% / 1.78)",
        "top": "206px",
        "position": "relative",
      },
      "ROTATOR_OFF":{
        "height": "",
        "top": "0px",
        "position": "absolute",
      },
      "ROTATOR_ON_PAD":{
        "padding-bottom":"0%",
      },
      "ROTATOR_OFF_PAD":{
        "padding-bottom":"100%",
      },
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
        $('#webcam_rotator.webcam_rotated').css(self.fullScreenStyles.ROTATOR_ON_PAD);
        $('#webcam_rotator.webcam_rotated > .webcam_fixed_ratio').css(self.fullScreenStyles.ROTATOR_ON);
        $('#webcam_container').css(self.fullScreenStyles.ON);
      }else{
        $('#webcam_rotator.webcam_rotated').css(self.fullScreenStyles.ROTATOR_OFF_PAD);
        $('#webcam_rotator.webcam_rotated > .webcam_fixed_ratio').css(self.fullScreenStyles.ROTATOR_OFF);
        $('#webcam_container').css(self.fullScreenStyles.OFF);
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
      "#webCam",
      "#fullscreenButton"
    ]
  });
});
