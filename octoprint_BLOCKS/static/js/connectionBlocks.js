$(function () {
    function ConnectionBlocksViewModel(parameters){
      var self = this;

      self.loginState = parameters[0];
      self.settings = parameters[1];
      self.printerProfiles = parameters[2];
      self.access = parameters[3];



      self.connect = function () {
        if ( OctoPrint.coreui.viewmodels.connectionViewModel.isErrorOrClosed()){
          var data = {
            port : "AUTO",
            baudrate: OctoPrint.coreui.viewmodels.connectionViewModel.selectedBaudrate() || 0,
            printerProfile: OctoPrint.coreui.viewmodels.connectionViewModel.currentProfile(),
            autoconnect: true
          };

          OctoPrint.connectionBlocks.connect(data).done(function () {
            OctoPrint.coreui.viewmodels.connectionViewModel.settings.requestData();
            OctoPrint.coreui.viewmodels.connectionViewModel.settings.printerProfiles.requestData();

          });
        }
      }

    }OCTOPRINT_VIEWMODELS.push({
      construct: ConnectionBlocksViewModel,
      dependencies: [
        "loginStateViewModel",
        "settingsViewModel",
        "printerProfilesViewModel",
        "accessViewModel"
      ],

      elements:["#connectionBlocks_wrapper"]
    });
});
