'use strict';

var VTX = {};
VTX.channels = [
    5865, 5845, 5825, 5805, 5785, 5765, 5745, 5725, // 0 to 7   (Boscam A)  
    5733, 5752, 5771, 5790, 5809, 5828, 5847, 5866, // 8 to 15  (Boscam B)  
    5705, 5685, 5665, 5645, 5885, 5905, 5925, 5945, // 16 to 23 (Boscam E)  
    5740, 5760, 5780, 5800, 5820, 5840, 5860, 5880, // 24 to 31 (Fatshark)  
    5658, 5695, 5732, 5769, 5806, 5843, 5880, 5917  // 32 to 39 (Raceband)  
];

VTX.bands = {
    'Boscam A': [5865, 5845, 5825, 5805, 5785, 5765, 5745, 5725],
    'Boscam B': [5733, 5752, 5771, 5790, 5809, 5828, 5847, 5866],
    'Boscam E': [5705, 5685, 5665, 5645, 5885, 5905, 5925, 5945],
    'Fatshark': [5740, 5760, 5780, 5800, 5820, 5840, 5860, 5880],
    'Raceband': [5658, 5695, 5732, 5769, 5806, 5843, 5880, 5917] 
};

VTX.bandList = [
    'Boscam A',
    'Boscam B',
    'Boscam E',
    'Fatshark',
    'Raceband'
];

TABS.vtx = {};
TABS.vtx.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'vtx') {
        GUI.active_tab = 'vtx';
    }

    function get_vtx_channel() {
        // @todo: determine how to read VTX configuration
        // MSP.send_message(?, false, false, load_html);
        load_html();
    }

    function load_html() {
        $('#content').load("./tabs/vtx.html", process_html);
    }

    function update_channel_list(band, channel) {
        var $vtx_channel = $('#vtx_channel');
        $vtx_channel.html('');

        // Get the first channel of the band
        var startIndex = VTX.bandList.indexOf(band) * 8;

        VTX.bands[band].forEach(function(frequency, index) {
            var option = document.createElement('option');

            // Channel number is the first channel plus the current index
            option.value = startIndex + index;

            option.innerHTML = (index + 1)+ ' ('+frequency+' MHz)';

            $vtx_channel.append(option);
        });

        if (channel) {
            $vtx_channel.val(channel);
        }
    }

    function update_values(channel, power) {
        // Get the band
        var bandIndex = Math.floor(channel / 8);
        var band = VTX.bandList[bandIndex];

        update_channel_list(band, channel);

        $('#vtx_power').val(options.power);
    }

    // @todo: read details from MSP
    get_vtx_channel();
    
    function update_ui() {
        // @todo: determine if VTX is supported
        var vtxSupported = true;
            
        $(".tab-vtx").toggleClass("supported", vtxSupported);

        if (!vtxSupported) {
            return;
        }
    }

    function process_html() {
        update_ui();

        // translate to user-selected language
        localize();

        // Do initial selection
        var channel = 32; // @todo: replace with values read from board
        var power = 0; // @todo: replace with values read from board
        update_values(channel, power);
        
        // Add listeners
        var $vtx_band = $('#vtx_band');
        var $vtx_channel = $('#vtx_channel');
        $vtx_band.on('change', function(e) {
            // Get the currently selected channel
            var curChannel = $vtx_channel.prop('selectedIndex');

            // Update the dropdown
            update_channel_list($vtx_band.val());

            // Select the same channel
            $vtx_channel.prop('selectedIndex', curChannel);
        });

        var $save_button = $('a.save');
        $save_button.on('click', function() {
          // MSP.promise(?); // @todo actually save
          GUI.log('VTX settings saved'); // @todo i18n
          var oldText = $save_button.text();
          $save_button.html('Saved'); // @todo i18n
          setTimeout(function () {
              $save_button.html(oldText);
          }, 2000);
        });

        // status data pulled via separate timer with static speed
        GUI.interval_add('status_pull', function () {
            MSP.send_message(MSPCodes.MSP_STATUS);
        }, 250, true);

        GUI.content_ready(callback);
    }
};

TABS.vtx.cleanup = function (callback) {
    if (callback) callback();
};
