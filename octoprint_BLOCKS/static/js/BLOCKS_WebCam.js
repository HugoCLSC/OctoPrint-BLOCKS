/*
 * View model for BLOCKS_WebCam
 *
 * Author: Hugo C. Lopes dos Santos Costa
 * License: APGLv3
 */

/*TODO: No control view model ele não utiliza como dependencia o webcam view model do plugin.
 *
 *   Utilizam o  ko, nas templates para dar bind da template da webcam para o control viewmodel
 *   Desta forma não utilizam como dependencia, mas depois na funcão vão buscar a data correspondente a
 *   camera para poder utilizar as funcoes desta
 */

$(function () {
    function BLOCKS_WebCamViewModel(parameters) {
        var self = this;

        self.settings = parameters[0];
        self.loginState = parameters[1];
        self.control = parameters[2];
        self.access = parameters[3];
        self.classicWebcam = parameters[4];
        self.webcamStatus = ko.observable(false);

        self.onStartupComplete = function () {
            // Append the camera container from control in the new tab
            $("#webcam_plugins_container ").appendTo(
                $("#tab_plugin_octoprint_BLOCKS")
            );

            $("#fullscreenButton").appendTo($("#webcam_img_container"));
            OctoPrint.coreui.viewmodels.controlViewModel.recreateIntersectionObservers();
            // I can now safelly remove the old control element from the page
            $("#control").remove();
        };

        self.onTabChange = function (current, previous) {
            if (current == "#tab_plugin_octoprint_BLOCKS") {
                self.onActivateWebcamTabBlink(true);
                self.webcamStatus(true);
                OctoPrint.coreui.viewmodels.controlViewModel.onBrowserTabVisibilityChange(
                    true
                );
            } else {
                self.onActivateWebcamTabBlink(false);
                self.webcamStatus(false);
                OctoPrint.coreui.viewmodels.controlViewModel.onBrowserTabVisibilityChange(
                    false
                );
            }

            if (self.classicWebcam.webcamError()) {
                console.log("There was an error on the webcam");
                OctoPrint.coreui.viewmodels.controlViewModel.onBrowserTabVisibilityChange(self.webcamStatus());
            }
        };

        self.onActivateWebcamTabBlink = function (value) {
            if (value) {
                $("#tab_plugin_octoprint_BLOCKS_link > a").attr(
                    "class",
                    "blink"
                );
                $("#tab_plugin_octoprint_BLOCKS_link > a").css(
                    "color",
                    "#f56161ed"
                );
            } else {
                $("#tab_plugin_octoprint_BLOCKS_link > a").attr("class", "");
                $("#tab_plugin_octoprint_BLOCKS_link > a").css("color", "");
            }
        };

        self.fullScreenStyles = {
            ON: {
                // width: "100%",
                width: window.innerWidth,
                // height: "100%",
                height: window.innerHeight,
                "z-index": "1070",
                position: "fixed",
                display: "block",
                top: "0px",
                bottom: "0px",
                right: "0px",
                left: "0px",
            },
            OFF: {
                width: "100%",
                height: "100%",
                "z-index": "unset",
                position: "relative",
                display: "",
                top: "unset",
                bottom: "unset",
                right: "unset",
                left: "unset",
            },
            ROTATOR_ON: {
                height: "calc(100% / 1.78)",
                top: "206px",
                position: "relative",
            },
            ROTATOR_OFF: {
                height: "",
                top: "0px",
                position: "absolute",
            },
            ROTATOR_ON_PAD: {
                "padding-bottom": "0%",
            },
            ROTATOR_OFF_PAD: {
                "padding-bottom": "100%",
            },
        };

        self.fullScreenState = ko.observable(false);
        self.fullScreenButton = ko.observable(undefined);

        self._webcamFixedRatio = document.querySelector(".webcam_fixed_ratio");
        self._webcamFixedRatioStyle =
            this._webcamFixedRatio.style.paddingBottom;

        self.fullScreenButton.subscribe(function (val) {
            try {
                // var _webcamFixedRatio = document.querySelector(".webcam_fixed_ratio");
                if (self.fullScreenState() === false) {
                    self.fullScreenOperations(true);
                    self.fullScreenState(true);
                } else if (self.fullScreenState() === true) {
                    self.fullScreenState(false);
                    self.fullScreenOperations(false);
                }
            } catch (e) {
                console.log(e);
            }
        });

        self.fullScreenOperations = function (state) {
            if (state === true) {
                $("#webcam_rotator.webcam_rotated").css(
                    self.fullScreenStyles.ROTATOR_ON_PAD
                );
                $("#webcam_rotator.webcam_rotated > .webcam_fixed_ratio").css(
                    self.fullScreenStyles.ROTATOR_ON
                );
                $("#webcam_img_container").css(self.fullScreenStyles.ON);
                self._webcamFixedRatio.style.cssText = "padding-bottom: 49.5%;";
            } else {
                $("#webcam_rotator.webcam_rotated").css(
                    self.fullScreenStyles.ROTATOR_OFF_PAD
                );
                $("#webcam_rotator.webcam_rotated > .webcam_fixed_ratio").css(
                    self.fullScreenStyles.ROTATOR_OFF
                );
                $("#webcam_img_container").css(self.fullScreenStyles.OFF);
                self._webcamFixedRatio.style.paddingBottom =
                    self._webcamFixedRatioStyle;
            }
        };
        // This event listener serves for the full screen video player
        // When the user presses Escape when the video is full screen
        var bod = document.querySelector("html");
        bod.addEventListener("keydown", (e) => {
            if (
                (e.key === "Escape" || e.key === "Esc") &&
                self.fullScreenState() === true
            ) {
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
            "accessViewModel",
            "classicWebcamViewModel",
        ],
        elements: ["#fullscreenButton"],
        // elements: ["#classicwebcam_plugin_container"],
    });
});
