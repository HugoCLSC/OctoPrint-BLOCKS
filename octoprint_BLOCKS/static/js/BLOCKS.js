/*,
 * View model for BLOCKSUI
 *
 * Author: Hugo C. Lopes Santos Costa
 * License: AGPLv3
 */
//~~ Gets me the jquey-ui libraries
$('head').prepend('<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">');

//~~ Get me that bootstrap version 5 (Causes things to desformat on the page, i'll fix that....)
$('head').prepend('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">');

$(function() {
    function BlocksViewModel(parameters) {
        var self = this;

        //Run in debug/verbose mode
        self.debug = false;

        // assign the injected parameters, e.g.:
        self.settings = parameters[0];
        self.connection = parameters[1];
        self.control = parameters[2];
        self.temperature = parameters[3];
        self.appearance = parameters[4];
        self.access = parameters[5];
        self.printerState = parameters[6];

        // TODO: Implement your plugin's view model here.

        // Quick debug
        // Taken from UICustomizer plugin
        self.logToConsole = function(msg){
            if (!self.debug){
                return true;
            }
            if (typeof console.log == "function"){
                console.log('BLOCKS:',msg)
            }
        };

        //---------------------------------------------------------------------------
        self.onAllBound = function(){

          //Html can have mulitple classes
          $('#tabs').parent().addClass('BLOCKSMainTabs');


          //adds another class name for the octoprint-container i can now call it by BLOCKSMainContainer
          $('div.octoprint-container').addClass('BLOCKSMainContainer');


          // Load custom layout
          self.UpdateLayout(self.settings.settings.plugins.BLOCKS);

          // Refresh all
          window.setTimeout(function() {
              $(window).trigger('resize');
          },500);

          if(self.connection.isOperational()){
            $('#blocks_printer_connect').prop('checked', 'checked');
          }

          // Executes when the window is loaded
          // window.onload = function(){
          //
          // };

        };
        //                    onAllBound END
        //---------------------------------------------------------------------------
        self.onStartupComplete = function () {
          $('#navbar > .navbar-inner > .container-fluid > .brand > span').text("BLOCKS");
        };

        self.onEventConnecting = function () {
          $('#blocks_printer_connect').prop('disabled','disabled');
          if(!self.connectIt()){
            $('#blocks_printer_connect').prop('checked', 'checked');
          }
          $('#blocksWrapper > .container-fluid ').addClass('scale-up-ver-top');

          $('#PrinterImg').removeClass('scale-down-center').addClass('scale-in-center');
        };

        self.onEventConnected = function () {
          $('#blocks_printer_connect').removeAttr('disabled');
          console.log('Connected');
        };

        self.onEventDisconnecting = function () {
          $('#blocks_printer_connect').prop('disabled','disabled');
          if(self.connectIt()){
            $('#blocks_printer_connect').removeAttr('checked');
          }
          $('#PrinterImg').removeClass('scale-in-center').addClass('scale-down-center');
        };

        self.onEventDisconnected = function () {
          // I'll reset the fan slider
          self.fanControl(0);
          $('#blocks_printer_connect').removeAttr('disabled');
          console.log('Disconnected');
        };


        self.fromCurrentData = function (data) {
          var bleh = $('#blocks_printer_connect').prop("checked");
          console.log(bleh);
          if(data.state.text == "Operational" && bleh == false){
            self.set_ConnectionSwitch(true);
          }
        };

        self.set_ConnectionSwitch = function(val){
          var elems = document.querySelectorAll("[switch-color]");
          var size = elems.length;
          if(val === 'true' || val == true){
            for(let i=0; i<= size; i++){
              var elem = elems.item(i);
              $(elem).attr("switch-color", "green");
            }
            $('#blocks_printer_connect').prop("checked", true);
            self.setStorage('ConnectionState', true);
          }else{
            for(let i=0; i <= size; i++){
              var elem = elems.item(i);
              $(elem).attr("switch-color", "red");
            }
            $('#blocks_printer_connect').prop("checked", false);
            self.setStorage('ConnectionState', false);
          }
        };
        //---------------------------------------------------------------------------
        // Connection switch trigger functionality, this set of instructions is what
        // make the switch work
        //
        //---------------------------------------------------------------------------

        // ~~ observable so i know if my toggle switch is on or off
        // ~~ My observable trigger, lets me know if the connection switch is
        // ~~ on or off
        self.connectIt = ko.observable(undefined);
        // ~~ subscribes my switch to a funcion, this function will always run when the
        // ~~ switch state changes (When it's pressed or not)
        self.connectIt.subscribe(function(newVal){
          if(newVal){
            OctoPrint.connection.connect();
            console.log("Printer connecting....");
          }else{
            OctoPrint.connection.disconnect();
            console.log("Printer disconnecting....");
          }
        });

        // ~~ Change the text on my connection trigger switch
        // ~~ Will display Connected/Disconnected

        // ~~ it also changes the color of the connection trigger
        // ~~ Connected =:= Green
        // ~~ Disconnected =:= Red
        self.connection_labelText = ko.pureComputed(function () {
          if (self.connection.isErrorOrClosed()){
              self.set_ConnectionSwitch(false);
              return gettext("Disconnected");
            }else{
              self.set_ConnectionSwitch(true);
              return gettext("Connected");
            }
        });
        //---------------------------------------------------------------------------

        //---------------------------------------------------------------------------
        self.UpdateLayout= function(settingsPlugin){

          self.logToConsole('Blocks Updating layout');

          self.set_fixedHeader(settingsPlugin.fixedHeader());

          self.set_fluidLayout(settingsPlugin.fluidLayout());

          self.set_blocksFooterInfo(settingsPlugin.blocksFooterInfo());
          //Builds the main layout
          self.set_mainLayout(settingsPlugin);
          // Remove the collapsible feature
          self.set_removeCollapsible(settingsPlugin.removeCollapsible());

          self.replaceHeadingElements(settingsPlugin);

          self.correctFilesWrapper(settingsPlugin);

          self.theming(settingsPlugin);
        };



        //---------------------------------------------------------------------------
        // In this function where i can change the layout of the main container
        self.set_mainLayout = function(settingsPlugin) {
          self.buildGrid(settingsPlugin);
          //In these set of instructions i set what each container on my grid has
          self.set_blocksWrapper(settingsPlugin);
          // ~~ Bind the remaining wrappers to the grid
          self.bindWrappers(settingsPlugin);
          // ~~The function where i create the Controls wrapper.
          self.set_ControlWrapper(settingsPlugin);

          self.set_TemperatureWrapper(settingsPlugin);

          self.set_tabbable(settingsPlugin);

          self.set_NewAppearence(settingsPlugin);

          self.remove_accordion(settingsPlugin);


          // ~~ Remove the sidebar, i don't need it anymore
          $('#sidebar').remove();
        };

        //---------------------------------------------------------------------------
        self.buildGrid = function (settingsPlugin) {
          //What i want to do here is just create a matrix 3x3
          $('div.BLOCKSMainContainer > div.row').removeClass('row').addClass('row-fluid').addClass('TopRow').addClass('px-4');
          //add another row after the TopRow
          $('<div class= "row-fluid BotRow px-4" ></div>').insertBefore('div.footer');
          //add an id to both rows
          $('div.BLOCKSMainContainer > div.row-fluid.TopRow').attr('id','BLOCKSRowTop');
          $('div.BLOCKSMainContainer > div.row-fluid.BotRow').attr('id','BLOCKSRowBot');
          // All that is left to do is just create my collumns.
          $('#BLOCKSRowTop').append('<div class="col-4-md BLOCKCol1" data-theme="light" id="BTC1"></div>');
          $('#BLOCKSRowTop').append('<div class="col-4-md BLOCKCol2" data-theme="light" id="BTC2"></div>');
          $('#BLOCKSRowTop').append('<div class="col-4-md BLOCKCol3" data-theme="light" id="BTC3"></div>');
          $('#BLOCKSRowBot').append('<div class="col-4-md BLOCKCol1" data-theme="light" id="BBC1"></div>');
          $('#BLOCKSRowBot').append('<div class="col-4-md BLOCKCol2" data-theme="light" id="BBC2"></div>');
          $('#BLOCKSRowBot').append('<div class="col-4-md BLOCKCol3" data-theme="light" id="BBC3"></div>');
        };
        //---------------------------------------------------------------------------
        self.bindWrappers = function(settingsPlugin){
          $('#sidebar_plugin_firmware_check_info_wrapper').appendTo($('#BTC1'));
          $('#sidebar_plugin_firmware_check_warning_wrapper').appendTo($('#BTC1'));
          $('#state_wrapper').appendTo($('#BTC2'));
          $('div.tabbable.span8').appendTo($('#BBC2'));
          $('#files_wrapper').appendTo($('#BBC3'));

          $('#LightDarkSwitchWrapper').appendTo($('#navbar > .navbar-inner > .container-fluid'));
        };
        //---------------------------------------------------------------------------
        // Took from UICustumizer
        self.set_fixedHeader = function(enable) {
          if(enable){
            $('body').addClass('BLOCKSUIfixedHeader');
            $('#navbar').removeClass('navbar-static-top').addClass('navbar-fixed-top');
            $('#navbar').css('overflow','visible').css('padding-top','0').css('display','block');
          }else{
            $('body').removeClass('BLOCKSUIfixedHeader');
            $('#navbar').addClass('navbar-static-top').removeClass('navbar-fixed-top');
            $('#navbar').css('overflow','');
          }
        }
        self.set_NewAppearence = function () {
          // Fix Navbar Related
          // Makes the border color and shadow disappear
          $(".navbar-inner").css({"box-shadow":"unset","-webkit-box-shadow": "unset", "border":"1px"});
          $('.navbar-fixed-top > .navbar-inner').css({"-webkit-box-shadow":"unset", "box-shadow": "unset"});
          self.add_subAttributeData_Theme();
        };
        self.add_subAttributeData_Theme = function(){
          $('.BLOCKSMainContainer').attr('data-theme','light');
          $('#navbar > .navbar-inner > .container-fluid').attr('data-theme','light');
          var elems = document.getElementsByClassName('nav');
          var size = elems.legnth;
          for(let i=0; i <= size ; i++){
            var elem = elems.item(i);
            $(elem).attr('data-theme', 'dark');
          }

        }
        self.replaceHeadingElements = function () {
          // A ideia é copiar todos os atributos daquele elemento e depois contruir
          // um outro elemento da tag div e substituir o anterior por este
          // var elems = document.getElementsByTagName("a");
          var elems = document.getElementsByClassName("heading");
          for(let i=0; i < elems.length ; i++){
            var type = elems.item(i);
            // The next line gives me the element tag name (a, div, etc..)
            var tag = $(type).prop("tagName");
            // console.log(type);
            var classNames = $(type).attr("class");
            var elementText = $(type).text();
            if( (classNames == 'container-fluid heading') && (tag =="A")){
              var dataTargetNames = $(type).attr('data-target');
              var idName = $(type).attr('data-test-id');
              var childs = $(type).children();
              var parents = $(type).parent();
              var new_id = dataTargetNames.concat("_heading").replace("#","");
              $(type).replaceWith("<div class= \"" + classNames + "\"  id= \"" + new_id + "\" ></div>");
              var new_Elem = document.getElementById(new_id);
              $(new_Elem).text(elementText);
              $(new_Elem).prepend(childs[0]);
            }
          }

        };
        //---------------------------------------------------------------------------
        self.set_fixedFooter = function(enable) {
          if(enable){
            $('.footer').css("position", "fixed");
            $('.footer').css("display", "inline-flex");
            $('.footer').css("justify-content","space-between");
            $('.footer').css("background-color", "rgb(233,233,233)");
            $('.footer').css("left","0px");
            $('.footer').css("bottom","0px");
            $('.footer').css("right","0px");
          }
        };
        //---------------------------------------------------------------------------
        self.set_blocksFooterInfo = function(enable) {
          if(enable){
            $('#footer_links').prepend('<li><a href="https://www.blockstec.com/" id="blocks_link" target="_blank" rel="noreferrer noopener"> <img src="./plugin/BLOCKS/static/img/Blocks_Logo.png"> </a></li>');
          }
        };
        //---------------------------------------------------------------------------
        self.set_blocksWrapper = function(settingsPlugin){
          // The idea od this wrapper is to have the button for the connection and all the printer notifications
          // on the same space. So i'll just append the wrappers to the correct place
          $('#blocksWrapper').appendTo($('#BTC1'));
          // I want the printer notifications and be able to connect to the printer in the same space
          $('#blocks_notifications_wrapper').appendTo('#blocksWrapper');
          // Add a refresh button to the connection/warnings wrapper
          // I now have a refresh button next to my connection slider
          $('#blocksWrapper > .container-fluid').append($('#refreshButton'));
          $('#refreshButton').insertBefore($('#PrinterImg'));
          // I'll need to introduce, at least a sentence saying that this container has the Notifications
          $('#sidebar_plugin_action_command_notification').prepend('<div class="container-fluid heading"><i class ="fa fa-bell"></i> Notifications </div>');
        };



        //---------------------------------------------------------------------------
        self.correctFilesWrapper = function(settingsPlugin){
          $('#files_wrapper > div.container-fluid.heading').attr('role','group');
          $('.btn-group').css({'font-size': ''});
          $('#files_wrapper > div.container-fluid.heading').children().removeClass('btn-group');

          //i'm going to wrap the three files triggers inside a container
          $('#files_wrapper > .container-fluid >  div.accordion-heading-button').wrapAll('<div class = "container-fluid filesButtons" id="files_triggers"></div>');

          $('#files > .accordion-inner').addClass('container-fluid body').removeClass('accordion-inner');

          $('#files_triggers').appendTo($('#files_heading'));

          // Fix the Css on the files
          $('.dropdown-menu').addClass("dropdown-menu-right");
        };

        //---------------------------------------------------------------------------
        // This is for my fan slider, i can increment the fan speed by ~~1%
        self.fanControl = ko.observable(0);

        self.fanControl.subscribe(function(rangeVal){
          var fanSpeed = 2.6*rangeVal;
          var fanCommand = 'M106 S'+fanSpeed;
          self.control.sendCustomCommand({type:'command', command: fanCommand});
        });
        self.fanText = ko.pureComputed( function() {
          var fanSpeed = self.fanControl();

          return gettext(fanSpeed +'%');
        });

        self.motorDisable = ko.observable(undefined);

        self.motorDisable.subscribe(function(Val){
          if(Val){
            self.control.sendCustomCommand({type: 'command', command:'M18'});
          }
        });

        // The following set of functions serves for the load/unload filament buttons
        // and all the buttons to select which type of filament we have
        self.loadFilament = ko.observable(undefined);
        self.filamentType = ko.observable(['PLA', 'Other']);
        // The default temperature is set to 205 Celsius
        self.newTarget = ko.observable(undefined);

        self.loadFilament.subscribe(function(Val){
          if(Val){
            var newCommand = 'M109 S' + self.newTarget();
            console.log(newCommand);
            self.control.sendCustomCommand({type: 'command', command: newCommand});
            self.control.sendCustomCommand({type: 'command', command: 'M600'});
            self.temperature.setTargetsToZero();
          }
        });

        self.loadFilamentText = ko.pureComputed( function(){
          if(self.loadFilament()){
            return gettext('Changing');
          }else{
            return gettext('Load');
          }
        });


        self.filamentOper = function (data){
          if (data == "PLA"){
            self.newTarget(180);
          }else if (data == "Other"){
            self.newTarget(240);
          }else {
            self.newTarget(210);
          }
        };


        self.babystepZ = ko.observable(undefined);

        self.babystepZ.subscribe(function(range){
          OctoPrint.printer.jog({"z": range});
        });
        self.babystepZText = ko.pureComputed( function(){
          var value = self.babystepZ();
          return gettext(value+'%');
        });
        //---------------------------------------------------------------------------
        self.set_ControlWrapper = function(settingsPlugin){
          // Wrap my #control ( Made by OctoPrint ) on a new division with the ID="control_wrapper"
          $('#control').wrap('<div id="control_wrapper" class="container-fluid" data-bind="visible: loginState.hasAnyPermissionKo(access.permissions.CONTROL) && control.isOperational() "></div>');
          // Remove the tab-pane class because it's no longer a tab pane, it's a separate wrapper now
          $('#control').removeClass('tab-pane').removeClass('container-fluid').addClass('container-fluid body');
          // This is for the heading, also gives it  the possibility to collapse.
          $('<a class="container-fluid" data-target="#control"></a>').insertBefore('#control');
          // I needed a inner wrapper so i used the query function wrapInner to wrap everything inside the #control
          $('#control').wrapInner('<div class="container-fluid"></div>');
          // Needed to wrap my header
          $('#control_wrapper > a').wrap('<div class="container-fluid heading"></div>');
          // Adds the gamepad icon in black and also adds the text "Controls" to the header
          $('#control_wrapper > div > a').append('<i class=" fas icon-black fa-gamepad"></i>');
          $('#control_wrapper > div > a').append(' Controls ');
          // Need to create a row-fluid
          $('#control > .container-fluid > div').wrapAll('<div class="row-fluid"></div>');
          // Fix the size of the control wrapper letters.
          $('h1').css("font-size","30px");
          // Finally i place my new control wrapper in my grid and correct the webcam
          $('#control_wrapper').appendTo($('#BTC3'));

          $('#control > .container-fluid > .row-fluid > .jog-panel').removeClass().addClass("panel");

          self.set_tabWebStream(settingsPlugin);
          $('#control > div > div > div:first-child').remove();
          $('#control > div > div > div:last-child').remove();

          // Now that i have this fna slider i really don't need the general tab.


          $('#control-jog-general').remove();
          $('#control > .container-fluid > .row-fluid').append('<div class="container-fluid" id="filamentStep"></div>');
          $('#control > .container-fluid > .row-fluid').addClass('container-fluid').removeClass('row-fluid');

          // I'll add my control filament buttons here
          $('#control_filament').appendTo($('#filamentStep'));
          $('#babystepZ').appendTo($('#filamentStep'));
          $('#fanSlider').appendTo($('#control > .container-fluid > .container-fluid'));


        };

        //---------------------------------------------------------------------------
        self.set_tabWebStream = function (settingsPlugin){
          $('#webcam_hls_container').wrap('<div id="webCam" class = "tab-pane" data-bind = "visible: loginState.hasAnyPermissionKo(access.permissions.WEBCAM)"></div>');
          $('#webcam_container').appendTo($('#webCam'));
          $('#webCam').appendTo($('#tabs_content'));
          $('#webCam').append('<div data-bind="visible: control.keycontrolPossible() && loginState.hasPermissionKo(access.permissions.WEBCAM, access.permissions.CONTROL)" ><small class="muted">Hint: If you move your mouse over the video, you enter keyboard control mode.</small></div>');
          // Add a Webcam  tab to the tabbable
          $('#webcam_link').appendTo($('#tabs'));
          // The webCam only initializes if the control tab is clicked.
          // Since the controls won't be in the tabbable i'll have to "click" hte tab before i delete it
          // Literally the same thing has the temperature graph problem i had

          $('div.tabbable > ul.nav.nav-tabs > #control_link > a').click();
        };

        self.set_tabbable = function(settingsPlugin){
          // Remove the container borders.
          $('#tabs_content').css("border-right", "unset");
          $('#tabs_content').css("border-left", "unset");
          $('#tabs_content').css("border-bottom", "unset");

          $('div.tabbable').removeClass('span8');
          $('#timelapse > h1').attr('class','dark');
          $('div.tabbable > ul.nav.nav-tabs > #control_link').remove();
          $('div.tabbable > ul.nav.nav-tabs > #temp_link').remove();
          // Neither do i need the old tabbable
          $('.TopRow > div.BLOCKSMainTabs').remove();
        }
        //---------------------------------------------------------------------------
        self.set_TemperatureWrapper = function(settingsPlugin) {
          $('#temp').wrap('<div id="temp_wrapper" class="container-fluid" data-bind="visible: loginState.hasAnyPermissionKo(access.permissions.STATUS, access.permissions.CONTROL)"></div>');

          $('#temp').removeClass('tab-pane').addClass('body');

          $('<a class="container-fluid heading" data-target = "#temperature" ></a>').insertBefore("#temp");

          $('#temp').wrapInner('<div class="container-fluid accordion-inner" ></div>');

          $('#temp_wrapper > a').wrap('<div class="container-fluid heading" ></div>');
          $('#temp_wrapper > div > a').append('<i class="fas icon-black fa-thermometer-quarter"></i>');
          $('#temp_wrapper > div > a').append(' Temperature ');
          //Place the wrapper in my grid
          $('#temp_wrapper').appendTo($('#BBC1'));
          $('#temperature-table').css("margin-top","0px");
          // Just a little hack so i can use the temperatureViewModel graph
          // Basically it presses the button on the tabs to create the grid
          // After the grid is created the tab is deleted from the tab container
          // because i don't need that tab there anymore
          $(".flot-text").css("color","rgb(255, 255, 255)");

          $('#temp_link > a').trigger('click');

        };
        //---------------------------------------------------------------------------
        //I don't want my elements to be collapsible
        self.set_removeCollapsible = function(enable){
          if(enable){

            $('#control_wrapper > div ').each( function() {
              $(this).removeClass('accordion-group').removeClass('accordion-heading').addClass('container-fluid');
            });
            $('#temp_wrapper > div ').each( function() {
              $(this).removeClass('accordion-group').removeClass('accordion-heading').addClass('container-fluid');
            });
            $('#state_wrapper > div ').each( function() {
              $(this).removeClass('accordion-group').removeClass('accordion-heading').addClass('container-fluid');
            });
            $('#sidebar_plugin_action_command_notification_wrapper > div ').each( function() {
              $(this).removeClass('accordion-group').removeClass('accordion-heading').addClass('container-fluid');
            });
            $('div.col-4-md > div').removeClass('accordion-group').addClass('container-fluid');
            $('div.col-4-md > div > div').removeClass('accordion-heading').removeClass('accordion-body');
            $('div.col-4-md > div > div > a').parent().addClass('container-fluid heading');
            $('div.col-4-md > div > div > a').removeClass('accordion-toggle').addClass('container-fluid heading');

            $('#state').removeClass('in').removeClass('collapse').addClass('container-fluid body');
            $('#state_wrapper > div.heading > a').removeAttr('data-toggle');

            $('#sidebar_plugin_action_command_notification').removeClass('in').removeClass('collapse').addClass('container-fluid body');
            $('#sidebar_plugin_action_command_notification_wrapper > div.heading > a ').removeAttr('data-toggle');

            $('#files').removeClass('in').removeClass('collapse').addClass('container-fluid body');
            $('#files_wrapper > div.heading > a').removeAttr('data-toggle');

          }else{
            // Maybe implement when we want the collapsible feature
          }
        };
        //---------------------------------------------------------------------------


        // Fix fluid layout
        // Took from UICustomizer
        self.set_fluidLayout = function(enabled){
            if (enabled){
                $('#navbar > div.navbar-inner > div:first').removeClass("container").addClass("container-fluid").removeAttr("style","");
                $('div.BLOCKSMainContainer').removeClass("container").addClass("container-fluid");
            }else{
                $('#navbar > div.navbar-inner > div:first').removeClass("container-fluid").addClass("container");
                $('div.BLOCKSMainContainer').removeClass("container-fluid").addClass("container");
            }
        };



        self.remove_accordion = function (settingsPlugin){
          try {
            var all_elements = document.getElementsByClassName('accordion-inner');
            for (let i=0 ; i < all_elements.length ; i++){
              var elem = all_elements.item(i);
              $(elem).addClass('container-fluid').removeClass('accordion-inner');
            }
          } catch (e) {
            console.log(e);
          }
        };

      //---------------------------------------------------------------------------
      self.selectThemeColors = ko.observable(false);
      self.theming = function(){
        // Get the settings
        var theme = self.getStorage('themeType');
        console.log(theme);

        self.selectThemeColors(theme);
        self.set_theme(theme);
        self.selectThemeColors.subscribe( function(val){
          self.set_theme(val);
        });
      };

      self.themeSwitchText = ko.pureComputed( function() {
        if(self.selectThemeColors() === 'true' || self.selectThemeColors() == true){
          $('#LightDarkSwitch').css("border")
          return gettext("Dark");
        }else{
          return gettext("Light");
        }
      });

      self.set_theme = function(val){
        var elements = document.querySelectorAll("[data-theme]");
        var size = elements.length;
        if(val === 'true' || val == true){
          for(let i = 0; i <= size; i++){
            var elem = elements.item(i);
            $(elem).attr("data-theme","dark");
          }
          $('#LightDarkSwitch').prop("checked", true);
          self.setStorage('themeType', val);
        }else{
          for(let i = 0; i <= size; i++){
            var elem = elements.item(i);
            $(elem).attr("data-theme","light");
          }
          $('#LightDarkSwitch').prop("checked", false);
          self.setStorage('themeType', val);
        }
      };

      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      self.setStorage = function(cname,cvalue){
          if (!Modernizr.localstorage) return;
          if (window.location.pathname != "/"){
              cname = window.location.pathname+cname;
          }
          localStorage['plugin.BLOCKS.'+cname] = cvalue;
          console.log("saving...");
      };

      self.getStorage = function(cname){
          if (!Modernizr.localstorage) return undefined;
          if (window.location.pathname != "/"){
              cname = window.location.pathname+cname;
          }
          return localStorage['plugin.BLOCKS.'+cname];
      };

    }
      //---------------------------------------------------------------------------
      //---------------------------------------------------------------------------
      //                            BlocksViewModel END
      //---------------------------------------------------------------------------
      //---------------------------------------------------------------------------

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: BlocksViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...

        // This is a list of dependencies to inject into the plugin, the order which you request here is the order
        // in which the dependencies will be injected into your view model upon instantiation via the parameters
        // argument
        dependencies: [
            "settingsViewModel",
            "connectionViewModel",
            "controlViewModel",
            "temperatureViewModel",
            "appearanceViewModel",
            "accessViewModel",
            "printerStateViewModel"],
        // Elements to bind to, e.g. #settings_plugin_BLOCKS, #tab_plugin_BLOCKS, ...
        elements: [
          "#blocksWrapper",
          "#fanSlider",
          "#blocksControlWrapper",
          "#control_filament",
          "#LightDarkSwitchWrapper",
          "#babystepZ"]
    });
});
