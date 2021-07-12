/*,
 * View model for BLOCKSUI
 *
 * Author: Hugo C. Lopes Santos Costa
 * License: AGPLv3
 */

 // add Jquery

$(function() {
    function BlocksViewModel(parameters) {
        var self = this;


        //Run in debug/verbose mode
        self.debug = false;

        // assign the injected parameters, e.g.:
        // self.loginStateViewModel = parameters[0];
        self.settings = parameters[0];



        // TODO: Implement your plugin's view model here.

        //max column width
        self.maxCWidth = 12;
        // Quick debug
        self.logToConsole = function(msg){
            if (!self.debug){
                return true;
            }
            if (typeof console.log == "function"){
                console.log('BLOCKS:',msg)
            }
        }

        self.onAllBound = function(){
          //~~ Set names

          //Html can have mulitple classes so
          $('#tabs').parent().addClass('BLOCKUImainTabs').wrap('<div class="BLOCKSUICol2></div>"');

          //Adds a class name for the class="container octoprint-container BLOCKSUICol1"
          //On the side bar i add another class name

          $('#sidebar').addClass('BLOCKSUICol1');

          //adds another class name for the octoprint-container i can now calle it BLOCKSUIMainContainer
          $('div.octoprint-container').addClass('BLOCKSUIMainContainer');





          // Load custom layout
          self.UpdateLayout(self.settings.settings.plugins.BLOCKS);
          // Fix consolidate_temp_control layout issues
          if (typeof OctoPrint.coreui.viewmodels.settingsViewModel.settings.plugins.consolidate_temp_control !== "undefined"){
              $('div.page-container').css({'min-width':''});
              $('div.footer').css({'padding-left':'','padding-right':''});
              $('div.BLOCKSUIMainContainer > div:first').css({'margin-left':'','padding-right':''});
              $('div.BLOCKSUIMainContainer').removeClass('row-fluid');
              $('div.BLOCKUImainTabs').removeClass('span10');
              $('div#tabs_content div.tab-pane:not("#tab_plugin_consolidate_temp_control") > div > div.span6').unwrap();
              $('div#tabs_content div.tab-pane:not("#tab_plugin_consolidate_temp_control") > div.span6').children().unwrap();
          }


          // Remove hardcode css to make it easier to use skins
          var styleSrcs = [];
          var cssLookUp = [
              'static/webassets/packed_core.css',
              'static/css/octoprint.css',
              'static/webassets/packed_plugins.css',
              'plugin/navbartemp/static/css/navbartemp.css'
          ];
          var cssFind = null;
          $.each(cssLookUp,function(i,cval){
              if ((cssFind = self.getStyleSheet(cval)) != null){
                  styleSrcs.push(cssFind);
              }
          });
          if (styleSrcs.length){
              $.each(styleSrcs,function(idx,styleSrc){
                  $.each(styleSrc.sheet.cssRules,function(index,val){
                      if (this.selectorText != undefined){
                          if (this.selectorText == ".octoprint-container .accordion-heading .accordion-heading-button a"){
                              this.selectorText = ".octoprint-container .accordion-heading .accordion-heading-button >a";
                          }
                          if (this.selectorText.indexOf('#navbar .navbar-inner .nav') != -1){
                              this.selectorText = '#navbardisabledByBLOCKS'
                          }
                          if (this.selectorText == "#navbar .navbar-inner"){
                              this.selectorText = '#navbardisabledByBLOCKS'
                          }
                          // Fix coding for navbar temp
                          if (this.selectorText == "#navbar_plugin_navbartemp .navbar-text"){
                              this.selectorText = '#navbardisabledByBLOCKS'
                          }
                      }
                  })
              });
          }

          // Refresh all
          window.setTimeout(function() {
              $(window).trigger('resize');
          },500);

        }
        //                    onAllBound END


        // --------------------------------------------------
        self.UpdateLayout= function(settingsPlugin){

          self.logToConsole('Updating layout');

          $('#sidebar').removeClass('span4');
          $('div.BLOCKSmainTabs').removeClass('span8');

          self.set_fixedHeader(settingsPlugin.fixedHeader());

          self.set_fluidLayout(settingsPlugin.fluidLayout());

          self.set_hideGraphBackground(settingsPlugin.hideGraphBackground());
          //Builds the main layout
          self.set_mainLayout(settingsPlugin);

        }

        //---------------------------------------------------
        self.getStyleSheet = function(cssUrlPart){
            var cssSel = $('link[href*="'+cssUrlPart+'"][rel="stylesheet"]');
            if (cssSel.length){
                return cssSel[0];
            }
            return null;
        }
        //---------------------------------------------------
        self.set_fixedHeader = function(enable){
          if(enable){
            $('body').addClass('BLOCKSUIfixedHeader');
            $('#navbar').removeClass('navbar-static-top').addClass('navbar-fixed-top');
            $('#navbar').css('overflow','visible');
          }else{
            $('body').removeClass('BLOCKSUIfixedHeader');
            $('#navbar').addClass('navbar-static-top').removeClass('navbar-fixed-top');
            $('#navbar').css('overflow','');
          }
        }

        //--------------------------------------------------
        self.set_hideGraphBackground = function(enable){
          if(enable){
            $('#temperature-graph').addClass('BLOCKSnoBackground');
          }else{
            $('#temperature-graph').removeClass('BLOCKSUIBackground');
          }
        }

        //-------------------------------------------------
        // In this function where i can change the layout of the main container
        self.set_mainLayout = function(settingsPlugin){
          var TempCols= [...settingsPlugin.rows()];


          // Remove empty right cols and bit of magic
          var CleanedCols=[];
          var cols = [];
          var colFound = false;
          CleanedCols.reverse();
          $(CleanedCols).each(function(key,val){
              if (val.length > 0 || colFound){
                  colFound = true;
                  cols.push(val);
              }else{
                  // Find the column index in the reversed order and mark them for deletion - we can just delete empty ones because we can have an empty filler
                  var keyRevFix = Math.abs(2-key)+1;
                  $('div.BLOCKSUICol'+keyRevFix).addClass('BLOCKSUIColDELETEME');
              }
          });
          cols.reverse();
          self.logToConsole('Building '+cols.length+ ' columns layouts:' + JSON.stringify(cols));


          $('div.BLOCKSUIMainContainer > div.row').removeClass('row').addClass('row-fluid').addClass('TopRow');

          //add another row after the TopRow
          $('<div class= "row-fluid BotRow" ></div>').insertBefore('div.footer');
          //add an id to both rows
          $('div.BLOCKSUIMainContainer > div.row-fluid.TopRow').attr('id','BLOCKSRowTop');
          $('div.BLOCKSUIMainContainer > div.row-fluid.BotRow').attr('id','BLOCKSRowBot');


          //Now i need to build all the collumns I NEED 3

          $('#BLOCKSRowTop').append('<div class="col accordion span4 BLOCKCol1" id="BTC1">1</div>');
          $('#BLOCKSRowTop').append('<div class="col accordion span4 BLOCKCol2" id="BTC2">2</div>');
          $('#BLOCKSRowTop').append('<div class="col accordion span4 BLOCKCol3" id="BTC3">3</div>');


          $('#BLOCKSRowBot').append('<div class="col accordion span4 BLOCKCol1" id="BBC1">1</div>');
          $('#BLOCKSRowBot').append('<div class="col accordion span4 BLOCKCol2" id="BBC2">2</div>');
          $('#BLOCKSRowBot').append('<div class="col accordion span4 BLOCKCol3" id="BBC3">3</div>');

          //grid that i made, it's a  3x3 matrix
          //Clone the state_wrapper and places it on my grid [1,3]
          var div_state = $('#state_wrapper').clone().appendTo($('#BTC1'));
          //Clone tabs
          var div_tabs= $('div.tabbable.span8').clone().appendTo($('#BTC2'));
          //Clones the connection_wrapper and places it in my grid [1,1]
          var div_connection = $('#connection_wrapper').clone().appendTo($('#BTC3'));
          //Clone the files_wrapper  [1,2]
          var div_sidebar_plugin_firmware_check_info_wrapper = $('#sidebar_plugin_firmware_check_info_wrapper').clone().appendTo($('#BTC3'));
          var div_sidebar_plugin_firmware_check_warning_wrapper = $('#sidebar_plugin_firmware_check_warning_wrapper').clone().appendTo($('#BTC3'));
          // clone sidebar_plugin_action_command_notification_wrapper
          // Eu adiconei isto aqui porque no UICuatumizer também têm mas eu tenho que ver isso porque pode não estar a fazer nada.)
          var div_sidebar_plugin_action_command_notification__wrapper = $('#sidebar_plugin_action_command_notification_wrapper').clone().appendTo($('#BBC1'));
          //Clones the files_wrapper and clones it to the node with the id of "BBC3"
          var div_files = $('#files_wrapper').clone().appendTo($('#BBC3'));

          $('#sidebar').remove();
          $('div.tabbable').removeClass('span8');
          $('div.TopRow > div.tabbable').remove();

        }


        //------------------------------------------------------------
        // Fix fluid layout
        self.set_fluidLayout = function(enabled){
            if (enabled){
                $('#navbar > div.navbar-inner > div:first').removeClass("container").addClass("container-fluid").removeAttr("style","");
                $('div.BLOCKSUIMainContainer').removeClass("container").addClass("container-fluid");

            }else{
                $('#navbar > div.navbar-inner > div:first').removeClass("container-fluid").addClass("container");
                $('div.BLOCKSUIMainContainer').removeClass("container-fluid").addClass("container");

            }
        }
        // ------------------------------------------------------------------------------------------------------------------------









      }


    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: BlocksViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [
                      "loginStateViewModel",
                      "settingsViewModel",
                      "printerProfilesViewModel",
                      "accessViewModel"],
        // Elements to bind to, e.g. #settings_plugin_BLOCKS, #tab_plugin_BLOCKS, ...
        elements: []
    });
});
