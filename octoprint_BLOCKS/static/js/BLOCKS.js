/*
 * View model for BLOCKSUI
 *
 * Author: Hugo C. Lopes Santos Costa
 * License: AGPLv3
 *
 *
 */
$(function() {
    function BlocksViewModel(parameters) {
        var self = this;

        self.debug = false;

        self.settings = parameters[0];
        self.connection = parameters[1];
        self.control = parameters[2];
        self.temperature = parameters[3];
        self.appearance = parameters[4];
        self.access = parameters[5];
        self.printerState = parameters[6];

        // Debugger
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
          try {
            // Load custom layout
            self.UpdateLayout(self.settings.settings.plugins.BLOCKS);

            // Refresh all
            window.setTimeout(function() {
                $(window).trigger('resize');
            },500);

            // This helps prevent a bug on the connection switch
            if(self.connection.isOperational()){
              $('#blocks_printer_connect').prop('checked', 'checked');
            }

          } catch (e) {
            self.logToConsole(e);
            self.logToConsole(e);
          }
        };
        //                    onAllBound END
        //---------------------------------------------------------------------------
        self.onStartupComplete = function () {
          $('#navbar > .navbar-inner > .container-fluid > .brand > span').text("BLOCKS");
          self.set_PrinterImg();


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
            $('#blocks_printer_connect').removeAttr('checked','disabled');
          }

          $('#PrinterImg').removeClass('scale-in-center').addClass('scale-down-center');
        };

        self.onEventDisconnected = function () {
          // I'll reset the fan slider here
          self.fanControl(0);
          $('#blocks_printer_connect').removeAttr('disabled');
          $('#PrinterImg > img').remove();
          // self.setStorage('Machine_Type', 'undefined');
          console.log('Disconnected');
        };

        self.fromCurrentData = function (data) {
          try {
            // If the printer was connected and then the user refreshed the page the trigger switch
            // would bug and not diaplay the correct state for the connection
            // this helps me check if the printer is connected or not and correct the switch state
            var state = $('#blocks_printer_connect').prop("checked");
            if(data.state.text == "Operational" && state == false){
              self.set_ConnectionSwitch(true);
            }
          } catch (e) {
            self.logToConsole(e);
          }
        };

        // This function listens for any messages sent
        self.onDataUpdaterPluginMessage = function(plugin, data){
          try {
            if(plugin != "BLOCKS" && data.type!="machine_info"){
              return;
            }

            // Hope this corrects the bug where there are more than one tab open of the octoprint more images of the printer whould show up
            // if(checkImg != undefined){
            //   return;
            // }
            // The idea is to change the printer picture on the web interface acording to the connected Printer
            // It only works if it's a Blocks 3D Printer
            // At this moment there are only three models available to the public
           if(data.message == "Blocks Pro S30"){
             // $("<img src='./plugin/BLOCKS/static/img/Blocks_PS30.png'>").appendTo($('#PrinterImg'));
             self.setStorage('Machine_Type', "<img src='./plugin/BLOCKS/static/img/Blocks_PS30.png'>");
           }else if (data.message == "Blocks zero"){
             // $("<img src='./plugin/BLOCKS/static/img/Blocks_zero.png'>").appendTo($('#PrinterImg'));
             self.setStorage('Machine_Type', "<img src='./plugin/BLOCKS/static/img/Blocks_zero.png'>");
           }else if (data.message == "Blocks One MKII" ){
             // $("<img src='./plugin/BLOCKS/static/img/Blocks_mkii2.png'>").appendTo($('#PrinterImg'));
             self.setStorage('Machine_Type', "<img src='./plugin/BLOCKS/static/img/Blocks_mkii2.png'>");
           }

           self.set_PrinterImg();
          } catch (e) {
            self.logToConsole(e);
          }
        };

        //---------------------------------------------------------------------------
        self.UpdateLayout= function(settingsPlugin){
          self.logToConsole('Blocks Updating layout');
          $('#tabs').parent().addClass('BLOCKSMainTabs');
          //adds another class name for the octoprint-container i can now call it by BLOCKSMainContainer
          $('div.octoprint-container').addClass('BLOCKSMainContainer');
          self._set_fixedHeader(settingsPlugin);
          self._set_fluidLayout(settingsPlugin);
          self._set_blocksFooterInfo(settingsPlugin);
          //Builds the main layout
          self.set_mainLayout(settingsPlugin);
          // Remove the collapsible feature
          self._set_removeCollapsible(settingsPlugin);
          self._replaceHeadingElements(settingsPlugin);
          self._correctFilesWrapper(settingsPlugin);
          // Since the Light/Dark theming is stored in the localStorage
          // This will get and set the correnct theming
          self._theming(settingsPlugin);
        };
        //---------------------------------------------------------------------------
        self.set_PrinterImg = function() {
          var printer = self.getStorage('Machine_Type');
          var img =  $("#PrinterImg > img");
          var size = img.length;
          console.log(img);
          console.log(printer);
          if(printer == "undefined"){
            self.control.sendCustomCommand({type:'command', command: 'M115'});
          }
          if(size == 0){
            $(printer).appendTo($('#PrinterImg'));
          }
        };
        //---------------------------------------------------------------------------
        // Saw this on UICustumizer
        // https://github.com/LazeMSS/OctoPrint-UICustomizer
        self._set_fixedHeader = function(enable) {
          try {
            $('body').addClass('BLOCKSUIfixedHeader');
            $('#navbar').removeClass('navbar-static-top').addClass('navbar-fixed-top');
            $('.navbar').css("position","fixed");
            $('#navbar').css('overflow','visible').css('padding-top','0').css('display','block');
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // Fix fluid layout
        // Saw this on UICustomizer
        // https://github.com/LazeMSS/OctoPrint-UICustomizer
        self._set_fluidLayout = function(enabled){
          try {
            $('#navbar > div.navbar-inner > div:first').removeClass("container").addClass("container-fluid").removeAttr("style","");
            $('div.BLOCKSMainContainer').removeClass("container").addClass("container-fluid");
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self._set_blocksFooterInfo = function(enable) {
          // Just adds a hyperlink to the Blocks website and an image with the company Logo on the footer
          try {
            $('#footer_links').prepend('<li><a href="https://www.blockstec.com/" id="blocks_link" target="_blank" rel="noreferrer noopener"> <img src="./plugin/BLOCKS/static/img/Blocks_Logo.png"> </a></li>');
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // In this function where i can change the layout of the main container
        self.set_mainLayout = function(settingsPlugin) {
          self._buildGrid(settingsPlugin);
          //In these set of instructions i set what each container on my grid has

          self.set_blocksWrapper(settingsPlugin);
          //Rearranges the tabs
          self.new_tabs(settingsPlugin);
          // ~~ Bind the remaining wrappers to the grid
          self._bindWrappers(settingsPlugin);

          self._set_NewAppearence(settingsPlugin);
          self.remove_accordion(settingsPlugin);
          self.fix_gcode_viewer();
        };
        //---------------------------------------------------------------------------
        // The way the grid is made is Basically the same way bootstrap examplifies
        // https://getbootstrap.com/docs/5.0/layout/grid/
        self._buildGrid = function (settingsPlugin) {
          try {
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
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self._bindWrappers = function(settingsPlugin){
          try {
            $('#sidebar_plugin_firmware_check_info_wrapper').appendTo($('#BTC1'));
            $('#sidebar_plugin_firmware_check_warning_wrapper').appendTo($('#BTC1'));
            $('#state_wrapper').appendTo($('#BTC2'));
            // $('div.tabbable.span8').appendTo($('#BBC2'));
            $('#webcam_link').appendTo($('#tabs'));
            // Finally i place my new control wrapper in my grid and correct the webcam
            $('#control_wrapper').appendTo($('#BTC3'));

            $('.BLOCKSMainTabs').appendTo($('#BBC2'));

            $('#files_wrapper').appendTo($('#BBC3'));
            $('#LightDarkSwitchWrapper').appendTo('#navbar > .navbar-inner > .container-fluid > .nav-collapse');
            // ~~ Remove the sidebar, i don't need it anymore
            $('#sidebar').remove();
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self._set_NewAppearence = function () {
          try {
            // Fix Navbar
            // Makes the border color and shadow disappear
            $(".navbar-inner").css({"box-shadow":"unset","-webkit-box-shadow": "unset", "border":"1px"});
            $('.navbar-fixed-top > .navbar-inner').css({"-webkit-box-shadow":"unset", "box-shadow": "unset"});
            // Remove the underline from the <a> elements
            $('.a').css("text-decoration","unset");


            self._add_subAttributeData_Theme();
          } catch (e) {
            self.logToConsole(e);
          }
        };
        self._add_subAttributeData_Theme = function(){
          try {
            $('.BLOCKSMainContainer').attr('data-theme','light');
            $('#navbar > .navbar-inner > .container-fluid').attr('data-theme','light');
            $('span').attr('data-theme', 'light');
            $('.help-block').attr('data-theme', 'light');
            $('.help-inline').attr('data-theme', 'light');
            $('#settings_dialog').attr('data-theme', 'light');
            // $('.modal').attr('data-theme', 'light');
            $('.modal-header').attr('data-theme', 'light');
            $('.modal-footer').attr('data-theme', 'light');
            $('.modal-body').attr('data-theme', 'light');
            $('.tab-pane').attr("data-theme", "light");
            $('.table').attr("data-theme","light");
            $('.gcode_files').attr("data-theme","light");
            var elemGroup1 = document.getElementsByClassName('nav');
            var groupSize = elems.length;
            var elemGroup2 = document.getElementsByClassName('tab-content');
            var groupSize2 = elems2.length;
            for(let i=0; i <= groupSize ; i++){
              var elem = elemGroup1.item(i);
              $(elem).attr('data-theme', 'dark');
            }
            for(let i=0; i<= groupSize2; i++){
              var elem2 = elemGroup2.item(i);
              $(elem2).attr('data-theme', 'dark');
            }
          } catch (e) {
            self.logToConsole(e);
          }
        };
        // This functions replaces all elements on the containers heading from <a> to <div>
        self._replaceHeadingElements = function () {
          try {
            // Gets me all the elements with the class name heading
            var elems = document.getElementsByClassName("heading");
            for(let i=0; i < elems.length ; i++){
              var type = elems.item(i);
              // The next line gives me the element tag name (a, div, etc..)
              var tag = $(type).prop("tagName");
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
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // Fixes the footer to the bottom of the page
        self.set_fixedFooter = function(enable) {
          try {
            $('.footer').css("position", "fixed");
            $('.footer').css("display", "inline-flex");
            $('.footer').css("justify-content","space-between");
            $('.footer').css("background-color", "rgb(233,233,233)");
            $('.footer').css("left","0px");
            $('.footer').css("bottom","0px");
            $('.footer').css("right","0px");
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self.set_blocksWrapper = function(settingsPlugin){
          try {
            // The idea od this wrapper is to have the button for the connection and all the printer notifications
            // on the same space. So i'll just append the wrappers to the correct place
            $('#blocksWrapper').appendTo($('#BTC1'));
            // I want the printer notifications and be able to connect to the printer in the same space
            $('#blocks_notifications_wrapper').appendTo('#blocksWrapper');
            $('#sidebar_plugin_action_command_notification').prepend('<div class="container-fluid heading"><i class ="fa fa-bell"></i> Notifications </div>');
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self._correctFilesWrapper = function(settingsPlugin){
          try {
            $('#files_wrapper > div.container-fluid.heading').attr('role','group');
            $('.btn-group').css({'font-size': ''});
            $('#files_wrapper > div.container-fluid.heading').children().removeClass('btn-group');
            //i'm going to wrap the three files triggers inside a container
            $('#files_wrapper > .container-fluid >  div.accordion-heading-button').wrapAll('<div class = "container-fluid " id="files_triggers"></div>');
            $('#files > .accordion-inner').addClass('container-fluid body').removeClass('accordion-inner');
            $('#files_triggers').appendTo($('#files_heading'));
            // Fix the Css on the files
            $('.dropdown-menu').addClass("dropdown-menu-right");
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // Connection switch trigger functionality, this set of instructions is what
        // make the switch work
        //---------------------------------------------------------------------------
        // ~~ My observable trigger, lets me know if the connection switch is
        // ~~ on or off
        self.connectIt = ko.observable(undefined);
        // ~~ subscribes my switch to a funcion, this function will always run when the
        // ~~ switch state changes (When it's pressed or not)
        self.connectIt.subscribe(function(newVal){
          try {
            if(newVal){
              OctoPrint.connection.connect();
              console.log("Printer connecting....");
            }else{
              OctoPrint.connection.disconnect();
              console.log("Printer disconnecting....");
            }
          } catch (e) {
            self.logToConsole(e);
          }
        });
        // ~~ Change the text on my connection trigger switch
        // ~~ Will display Connected/Disconnected
        // ~~ it also changes the color of the connection trigger
        // ~~ Connected =:= Green
        // ~~ Disconnected =:= Red
        self.connection_labelText = ko.pureComputed(function () {
          try {
            if (self.connection.isErrorOrClosed()){
                self.set_ConnectionSwitch(false);
                return gettext("Disconnected");
              }else{
                self.set_ConnectionSwitch(true);
                return gettext("Connected");
              }
          } catch (e) {
            self.logToConsole(e);
          }
        });
        // This function replaces the color of the button acording to the switch state
        // It also stores the switch state in the localStorage
        self.set_ConnectionSwitch = function(val){
          try {
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
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // This is for my fan slider, i can increment the fan speed by ~~1%
        self.fanControl = ko.observable(0);
        // This function is triggered everytime the value of fanControl changes
        self.fanControl.subscribe(function(rangeVal){
          try {
            var fanSpeed = 2.6*rangeVal;
            var fanCommand = 'M106 S'+fanSpeed;
            self.control.sendCustomCommand({type:'command', command: fanCommand});
          } catch (e) {
            self.logToConsole(e);
          }
        });
        self.fanText = ko.pureComputed( function() {
          try {
            var fanSpeed = self.fanControl();
            return gettext(fanSpeed +'%');
          } catch (e) {
            self.logToConsole(e);
          }
        });
        // This is for my disable motors button, sends the M18 GCode to disable the steppers.
        self.motorDisable = ko.observable(undefined);
        self.motorDisable.subscribe(function(Val){
          try {
            if(Val){
              self.control.sendCustomCommand({type: 'command', command:'M18'});
            }
          } catch (e) {
            self.logToConsole(e);
          }
        });
        // The following set of functions serves for the load/unload filament buttons
        // and all the buttons to select which type of filament we have
        self.loadFilament = ko.observable(undefined);
        self.filamentType = ko.observable(['180°', '200°', '210°']);
        // The default temperature is set to 180 Celsius
        self.newTarget = ko.observable(180);
        // console.log(self.newTarget());
        self.loadFilament.subscribe(function(Val){
          try {
            if(Val){
              var newCommand = 'M109 S' + self.newTarget();
              self.control.sendCustomCommand({type: 'command', command: newCommand});
              self.control.sendCustomCommand({type: 'command', command: 'M600'});
              // Coolsdown the hotend
              self.temperature.setTargetsToZero();
            }
          } catch (e) {
            self.logToConsole(e);
          }
        });
        // Executed everytime the user selects one of the temperatures on the Change Filament Button
        self.filamentOper = function (data){
          try {
            if (data == '180°'){
              self.newTarget(180);
            }else if (data == '200°'){
              self.newTarget(200);
            }else if (data == '210°') {
              self.newTarget(210);
            }
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self.new_tabs = function (settingsPlugin){
          self.set_ControlWrapper();
          self.set_tabWebStream();
          self.set_TemperatureWrapper();
          self.set_tabbable();
        }
        self.set_ControlWrapper = function(settingsPlugin){
          try {
            // Wrap my #control ( Made by OctoPrint ) on a new division with the ID="control_wrapper"
            $('#control').wrap('<div id="control_wrapper" class="container-fluid" data-bind="visible: loginState.hasAnyPermissionKo(access.permissions.CONTROL) && control.isOperational() "></div>');
            // Remove the tab-pane class because it's no longer a tab pane, it's a separate wrapper now
            $('#control').removeClass('tab-pane').addClass('body');
            // This is for the heading, also gives it  the possibility to collapse.
            $('<div class="container-fluid heading" ></div>').insertBefore('#control');
            // I needed a inner wrapper so i used the query function wrapInner to wrap everything inside the #control
            $('#control').wrapInner('<div class="container-fluid"></div>');
            // Adds the gamepad icon in black and also adds the text "Controls" to the header
            $('#control_wrapper > .container-fluid.heading').append('<i class=" fas icon-black fa-gamepad"></i>').append(' Controls ');
              $('#control_wrapper > .container-fluid.heading').wrap("<div class='container-fluid heading'></div>")
            // Need to create a row-fluid
            // $('#control > .container-fluid > div').wrapAll('<div class="container-fluid"></div>');
            // Fix the size of the control wrapper letters.
            $('h1').css("font-size","15px");
            $('h1').css("font-weight","bold");

            $('#control > .container-fluid > .row-fluid > .jog-panel').removeClass().addClass("panel");
            self.set_tabWebStream(settingsPlugin);
            $('#control > div  > div:first-child').remove();
            // $('#control > div > div > div:last-child').remove();
            // Now that i have this fna slider i really don't need the general tab.
            $('#control-jog-general').remove();
            $('#control > .container-fluid').append('<div class="container-fluid jog-panel" id="filamentStep"></div>');
            // I'll add my control filament buttons here
            $('#control_filament').appendTo($('#filamentStep'));
            $('#fanSlider').appendTo($('#control'));
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self.set_tabWebStream = function (settingsPlugin){
          try {
            $('#webcam_hls_container').appendTo($('#webCam'));
            $('#webcam_container').appendTo($('#webCam'));
            $('#webCam').appendTo($('#tabs_content'));
            // $('#webCam').append('<div data-bind="visible: control.keycontrolPossible() && loginState.hasPermissionKo(access.permissions.WEBCAM)" ><small class="muted">Hint: If you move your mouse over the video, you enter keyboard control mode.</small></div>');
            // Add a Webcam  tab to the tabbable
            $('#webCam').appendTo($('#tabs_content'));
            // The webCam only initializes if the control tab is clicked.
            // Since the controls won't be in the tabbable i'll have to "click" hte tab before i delete it
            // Literally the same thing has the temperature graph problem i had
            $('div.tabbable > ul.nav.nav-tabs > #control_link > a').click();
          } catch (e) {
            self.logToConsole(e);
          }
        };
        self.set_tabbable = function(settingsPlugin){
          try {
            // Remove the container borders.
            $('#tabs_content').css("border-right", "unset");
            $('#tabs_content').css("border-left", "unset");
            $('#tabs_content').css("border-bottom", "unset");
            $('div.tabbable').removeClass('span8');
            $('#timelapse > h1').attr('class','dark');
            // Remove the Tabs i don't need
            $('div.tabbable > ul.nav.nav-tabs > #control_link').remove();
            $('div.tabbable > ul.nav.nav-tabs > #temp_link').remove();
            $('div.tabbable > tabs_content > #temp');

          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        self.set_TemperatureWrapper = function(settingsPlugin) {
          try {
            $('#temp').wrap('<div id="temp_wrapper" class="container-fluid" data-bind="visible: loginState.hasAnyPermissionKo(access.permissions.STATUS, access.permissions.CONTROL)"></div>');
            $('#temp').removeClass('tab-pane').addClass('body');
            $('<a class="container-fluid heading" data-target = "#temperature" ></a>').insertBefore("#temp");
            $('#temp').wrapInner('<div class="container-fluid accordion-inner" ></div>');
            $('#temp_wrapper > a').wrap('<div class="container-fluid heading" ></div>');
            $('#temp_wrapper > div > a').append('<i class="fas icon-black fa-thermometer-quarter"></i>');
            $('#temp_wrapper > div > a').append(' Temperature ');
            //Place the wrapper in my grid
            $('#temp_wrapper').appendTo($('#BBC1'));
            $('#temperature-table').css("margin-top","0px").css("table-layout","unset");
            $('#temperature-table').removeClass('table-bordered').removeClass("table").addClass("table-sm");
            // Just a little hack so i can use the temperatureViewModel graph
            // Basically it presses the button on the tabs to create the grid
            // After the grid is created the tab is deleted from the tab container
            // because i don't need that tab there anymore
            // $(".flot-text").css("color","rgb(255, 255, 255)");
            $('.temperature_target').css('width','42%');
            $('.temperature_offset').css('width','42%');
            $('.temperature_tool').css('width','9%');
            $('#temp_link > a').trigger('click');
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // I really don't want my elements to be collapsible
        // I'll set my containers fluid here
        self._set_removeCollapsible = function(enable){
          try {
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
          } catch (e) {
            self.logToConsole(e);
          }
        };
        //---------------------------------------------------------------------------
        // I delete the accordion-inner class here
        self.remove_accordion = function (settingsPlugin){
          try {
            var all_elements = document.getElementsByClassName('accordion-inner');
            for (let i=0 ; i < all_elements.length ; i++){
              var elem = all_elements.item(i);
              $(elem).addClass('container-fluid').removeClass('accordion-inner');
            }
          } catch (e) {
            self.logToConsole(e);
          }
        };
      //---------------------------------------------------------------------------
      // This next set of functions are responsible for the Light/Dark switch
      self.selectThemeColors = ko.observable(false);
      self._theming = function(){
        try {
          // Get the settings
          var theme = self.getStorage('themeType');
          self.selectThemeColors(theme);
          self._set_theme(theme);
          self.selectThemeColors.subscribe( function(val){
            self._set_theme(val);
          });
        } catch (e) {
          self.logToConsole(e);
        }
      };
      self.themeSwitchText = ko.pureComputed( function() {
        try {
          if(self.selectThemeColors() === 'true' || self.selectThemeColors() == true){
            $('#LightDarkSwitch').css("border")
            return gettext("Dark");
          }else{
            return gettext("Light");
          }
        } catch (e) {
          self.logToConsole(e);
        }
      });
      self._set_theme = function(val){
        try {
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
        } catch (e) {
          self.logToConsole(e);
        }
      };
      // -----------------------------------------------------------------------
      // The Gcode viewer was a little wonky so i fixed it here
      self.fix_gcode_viewer = function() {
        try {
          $('#gcode_layer_slider').css('width','0%');
          $('#gcode_layer_slider').css('height','94%');
          $('#gcode_command_slider').css('width','100%');
          $('#gcode_canvas').css('width','100%');
          $('#gcode_canvas').css('height','100%');
        } catch (e) {
          self.logToConsole(e);
        }
      };
      // -----------------------------------------------------------------------
      // This is from Ui UICustumizer made by LazeMSS
      // https://github.com/LazeMSS/OctoPrint-UICustomizer
      self.setStorage = function(cname,cvalue){
        try {
          if (!Modernizr.localstorage) return;
          if (window.location.pathname != "/"){
              cname = window.location.pathname+cname;
          }
          localStorage['plugin.BLOCKS.'+cname] = cvalue;
        } catch (e) {
          self.logToConsole(e);
        }
      };
      self.getStorage = function(cname){
        try {
          if (!Modernizr.localstorage) return undefined;
          if (window.location.pathname != "/"){
              cname = window.location.pathname+cname;
          }
          return localStorage['plugin.BLOCKS.'+cname];
        } catch (e) {
          self.logToConsole(e);
        }
      };

    }
    //---------------------------------------------------------------------------
    //---------------------------------------------------------------------------
    //                            BlocksViewModel END
    //---------------------------------------------------------------------------
    //---------------------------------------------------------------------------
    OCTOPRINT_VIEWMODELS.push({
        construct: BlocksViewModel,
        dependencies: [
          "settingsViewModel",
          "connectionViewModel",
          "controlViewModel",
          "temperatureViewModel",
          "appearanceViewModel",
          "accessViewModel",
          "printerStateViewModel"],
        elements: [
          "#blocksWrapper",
          "#fanSlider",
          "#control_filament",
          "#LightDarkSwitchWrapper"]
    });
});
