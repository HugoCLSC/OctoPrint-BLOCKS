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
        self.loginState = parameters[2];
        // TODO: Implement your plugin's view model here.



        // Quick debug
        self.logToConsole = function(msg){
            if (!self.debug){
                return true;
            }
            if (typeof console.log == "function"){
                console.log('BLOCKS:',msg)
            }
        };




        //~~----------------------------------------------------
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

        };
        //                    onAllBound END
        //---------------------------------------------------


        // --------------------------------------------------------------------------
        // Connection switch trigger functionality, this set of instructions is what
        // make the switch work
        //
        // --------------------------------------------------------------------------
        // ~~ observable so i know if my toggle switch is on or off
        self.connectIt = ko.observable(undefined);
        // ~~ subscribes my switch to a funcion, this function will always run when the
        // ~~ switch state changes (When it's pressed or not)
        self.connectIt.subscribe(function(newVal){
          if(newVal){
            OctoPrint.connection.connect();
            console.log("Printer connecting.... ");
          }else{
            OctoPrint.connection.disconnect();
            console.log("Printer disconnecting....");
          }
        });
        // ~~ Change the text on my connection trigger switch
        self.connection_labelText = ko.pureComputed(function () {
            if (self.connection.isErrorOrClosed()) return gettext("Disconnected");
            else return gettext("Connected");
        });
        // ------------------------------------------------------------------------



        // ------------------------------------------------------------------------
        self.UpdateLayout= function(settingsPlugin){

          self.logToConsole('Updating layout');

          self.set_fixedHeader(settingsPlugin.fixedHeader());

          self.set_fluidLayout(settingsPlugin.fluidLayout());

          self.set_blocksFooterInfo(settingsPlugin.blocksFooterInfo());
          //Builds the main layout
          self.set_mainLayout(settingsPlugin);

          self.set_removeCollapsible(settingsPlugin.removeCollapsible());

          self.correctFilesWrapper(settingsPlugin);


        };


        //-------------------------------------------------------------------------
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
        };

        //------------------------------------------------------------------------------------------------
        self.set_fixedFooter = function(enable) {
          if(enable){

          }
        };
        //------------------------------------------------------------------------------------------------
        self.set_blocksFooterInfo = function(enable) {
          if(enable){
            $('#footer_links').prepend('<li><a href="https://www.blockstec.com/" target="_blank" rel="noreferrer noopener"> BLOCKS </a></li>');
          }
        };

        //-----------------------------------------------------------------------------------------------
        // In this function where i can change the layout of the main container
        self.set_mainLayout = function(settingsPlugin) {

          self.buildGrid(settingsPlugin);

          //In these set of instructions i set what each container on my grid has
          self.set_blocksWrapper(settingsPlugin);

          $('#state_wrapper').appendTo($('#BTC2'));
          // ~~The function where i create the Controls wrapper.
          self.set_ControlWrapper(settingsPlugin);


          $('div.tabbable.span8').appendTo($('#BBC2'));
          self.set_TemperatureWrapper(settingsPlugin);
          $('#sidebar_plugin_firmware_check_info_wrapper').appendTo($('#BTC1'));
          $('#sidebar_plugin_firmware_check_warning_wrapper').appendTo($('#BTC1'));
          $('#files_wrapper').appendTo($('#BBC3'));

          // I don't need the sidebar anymore
          $('#sidebar').remove();
          $('div.tabbable').removeClass('span8');
          // The tabs does not need the Control tab because the Control module is
          // on my grid
          $('div.tabbable > ul.nav.nav-tabs > #control_link').remove();
          $('div.tabbable > ul.nav.nav-tabs > #temp_link').remove();
          // Neither do i need the old tabbable
          $('.TopRow > div.BLOCKSMainTabs').remove();

        };

        // ------------------------------------------------------------------------------------------------------------------------
        self.buildGrid = function (settingsPlugin) {
          //What i want to do here is just create a matrix 3x3
          $('div.BLOCKSMainContainer > div.row').removeClass('row').addClass('row-fluid').addClass('TopRow').addClass('no-gutters');

          //add another row after the TopRow
          $('<div class= "row-fluid no-gutters BotRow" ></div>').insertBefore('div.footer');

          //add an id to both rows
          $('div.BLOCKSMainContainer > div.row-fluid.TopRow').attr('id','BLOCKSRowTop');
          $('div.BLOCKSMainContainer > div.row-fluid.BotRow').attr('id','BLOCKSRowBot');

          // All that is left to do is just create my collumns.
          $('#BLOCKSRowTop').append('<div class="col-4-md BLOCKCol1" id="BTC1"></div>');
          $('#BLOCKSRowTop').append('<div class="col-4-md BLOCKCol2" id="BTC2"></div>');
          $('#BLOCKSRowTop').append('<div class="col-4-md BLOCKCol3" id="BTC3"></div>');
          $('#BLOCKSRowBot').append('<div class="col-4-md BLOCKCol1" id="BBC1"></div>');
          $('#BLOCKSRowBot').append('<div class="col-4-md BLOCKCol2" id="BBC2"></div>');
          $('#BLOCKSRowBot').append('<div class="col-4-md BLOCKCol3" id="BBC3"></div>');
        }
        //------------------------------------------------------------
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
        // ------------------------------------------------------------------------------------------------------------------------
        // ~~ This wrapper is a simplified version of the connection and notifications wrappers
        // ~~ It's function is to just have a simple way to connect to the printer and receive
        // ~~ the notifications from that printer
        self.set_blocksWrapper = function(settingsPlugin){
          // The idea od this wrapper is to have the button for the connection and all the printer notifications
          // on the same space. So i'll just append the wrappers to the correct place
          $('#blocksWrapper').appendTo($('#BTC1'));
          // I want the printer notifications and be able to connect to the printer in the same space
          $('#sidebar_plugin_action_command_notification').appendTo('#blocksWrapper');

          // Add a refresh button to the connection/warnings wrapper
          // I now have a refresh button next to my connection slider
          $('#blocksWrapper > .container-fluid').append($('#refreshButton'));
        }

        // ------------------------------------------------------------------------
        self.correctFilesWrapper = function(settingsPlugin){
          $('#files_wrapper > div.container-fluid.heading').attr('role','group');
          $('.btn-group').css({'font-size': ''});
          $('#files_wrapper > div.container-fluid.heading').children().removeClass('btn-group');
        //  $('#files_wrapper > div.container-fluid.heading > a').removeClass('btn');
          self.fixFilesTriggers(settingsPlugin);
        }
        self.fixFilesTriggers = function(settingsPlugin) {
          //i'm going to wrap the three files triggers inside a container
          $('#files_wrapper > .container-fluid >  div.accordion-heading-button').wrapAll('<div class = "container-fluid "></div>')
        };
        // -------------------------------------------------------------------------------------------------------------------------

        self.set_ControlWrapper = function(settingsPlugin){

          // Wrap my #control ( Made by OctoPrint ) on a new division with the ID="control_wrapper"
          $('#control').wrap('<div id="control_wrapper" class="container-fluid" data-bind="visible: loginState.hasAnyPermissionKo(access.permissions.CONTROL)"></div>');

          // Remove the tab-pane class because it's no longer a tab pane, it's a separate wrapper now
          $('#control').removeClass('tab-pane').removeClass('container-fluid').addClass('container-fluid body');

          // This is for the heading, also gives it  the possibility to collapse.
          $('<a class="container-fluid" data-target="#control"></a>').insertBefore('#control');

          // I needed a inner wrapper so i used the query function wrapInner to wrap everything inside the #control
          $('#control').wrapInner('<div class="container-fluid accordion-inner"></div>');

          // Needed to wrap my header
          $('#control_wrapper > a').wrap('<div class="container-fluid heading"></div>');

          // Adds the gamepad icon in black and also adds the text "Controls" to the header
          $('#control_wrapper > div > a').append('<i class=" fas icon-black fa-gamepad"></i>');
          $('#control_wrapper > div > a').append(' Controls ');

          // Finally i place my new control wrapper in my grid
          $('#control_wrapper').appendTo($('#BTC3'));
        };
        // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
        self.set_TemperatureWrapper = function(settingsPlugin) {
          $('#temp').wrap('<div id="temp_wrapper" class="container-fluid" data-bind="visible: loginState.hasAnyPermissionKo(access.permissions.STATUS, access.permissions.CONTROL)"></div>');

          $('#temp').removeClass('tab-pane').addClass('body');

          $('<a class="container-fluid" ></a>').insertBefore("#temp");

          $('#temp').wrapInner('<div class="container-fluid accordion-inner" ></div>');

          $('#temp_wrapper > a').wrap('<div class="container-fluid heading"></div>');
          $('#temp_wrapper > div > a').append('<i class="fas icon-black fa-thermometer-quarter"></i>');
          $('#temp_wrapper > div > a').append(' Temperature ');
          //Place the wrapper in my grid
          $('#temp_wrapper').appendTo($('#BBC1'));

          // Just a little hack so i can use the temperatureViewModel graph
          // Basically it presses the button on the tabs to create the grid
          // After the grid is created the tab is deleted from the tab container
          // because i don't need that tab there anymore
          $('#temp_link > a').trigger('click');
        };

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




      }


    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: BlocksViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [
            "settingsViewModel",
            "connectionViewModel",
            "loginStateViewModel",
            "accessViewModel"
            ],
        // Elements to bind to, e.g. #settings_plugin_BLOCKS, #tab_plugin_BLOCKS, ...
        elements: [
          "#blocksWrapper"]
    });
});
