var ta = new TriAxisSysEx();

$(function(){
    $.event.props.push('dataTransfer');

    render();

    var $drop = $("#drop_zone");

    $drop.bind('dragover', function(e){
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    $drop.bind('drop', function(e){
        e.stopPropagation();
        e.preventDefault();

        var f = e.dataTransfer.files[0];

        var reader = new FileReader();

        reader.onloadend = function(){
            ta.init(reader.result);

            $("#triaxis").html();

            render();
        };
        reader.readAsArrayBuffer(f);
    });

    $('#download').click(function(){
        ta.download();
    });

});

function render(){
    var currentPreset = 0;

    var $base = $('#triaxis');
    var $preset = $('<div id="preset" class="component"></div>').appendTo($base);

    $preset.click(function(){
        if($preset.find('select').length){
            return;
        }
        var $sel = $('<select class="form-control"></select>').appendTo($preset);
        for(var i = 0; i < NUM_PRESETS; i++){
            $(sprintf('<option value="%d" %s>%d</option>', i, currentPreset == i ? "selected": "", i+1)).appendTo($sel);
        }
        $sel.change(function(){
            var val = $(this).val();
            console.log(val);
            currentPreset = 1*val;
            $sel.remove();
            renderPreset(currentPreset);
        });
    });

    var $gain = $('<div id="gain" class="component knobs" data-knob="gain"></div>').appendTo($base);
    var $treble = $('<div id="treble" class="component knobs" data-knob="treble"></div>').appendTo($base);
    var $middle = $('<div id="middle" class="component knobs" data-knob="middle"></div>').appendTo($base);
    var $bass = $('<div id="bass" class="component knobs" data-knob="bass"></div>').appendTo($base);
    var $lead1Drive = $('<div id="lead1Drive" class="component knobs" data-knob="lead1Drive"></div>').appendTo($base);
    var $lead2Drive = $('<div id="lead2Drive" class="component knobs" data-knob="lead2Drive"></div>').appendTo($base);
    var $master = $('<div id="master" class="component knobs" data-knob="master"></div>').appendTo($base);
    var $presence = $('<div id="presence" class="component knobs" data-knob="presence"></div>').appendTo($base);
    var $dVoice = $('<div id="dVoice" class="component knobs" data-knob="dVoice"></div>').appendTo($base);

    $('.knobs').click(function(){
        var $this = $(this);
        if($this.find('select').length){
            return;
        }

        var $sel = $('<select class="form-control"></select>').appendTo($this);
        var setting = new Setting(0);
        for(var i = 0; i < setting.settings.length; i++){
            $(sprintf('<option value="%s" %s>%s</option>',
                setting.settings[i].display,
                ta.presets[currentPreset].components[$this.attr('data-knob')].value.display == setting.settings[i].display ? "selected" : "",
                setting.settings[i].display)).appendTo($sel);
        }
        $sel.change(function(){
            var val = $(this).val();
            $sel.remove();
            ta.presets[currentPreset].components[$this.attr('data-knob')].setValue(val);
            renderPreset(currentPreset);
        });
    });

    var $tube_rhyGreen = $('<div id="tube_rhyGreen" class="tube" data-display="Rhythm Green"></div>').appendTo($base);
    var $tube_rhyYellow = $('<div id="tube_rhyYellow" class="tube" data-display="Rhythm Yellow"></div>').appendTo($base);
    var $tube_lead1Green = $('<div id="tube_lead1Green" class="tube" data-display="Lead 1 Green"></div>').appendTo($base);
    var $tube_lead1Yellow = $('<div id="tube_lead1Yellow" class="tube" data-display="Lead 1 Yellow"></div>').appendTo($base);
    var $tube_lead1Red = $('<div id="tube_lead1Red" class="tube" data-display="Lead 1 Red"></div>').appendTo($base);
    var $tube_lead2Green = $('<div id="tube_lead2Green" class="tube" data-display="Lead 2 Green"></div>').appendTo($base);
    var $tube_lead2Yellow = $('<div id="tube_lead2Yellow" class="tube" data-display="Lead 2 Yellow"></div>').appendTo($base);
    var $tube_lead2Red = $('<div id="tube_lead2Red" class="tube" data-display="Lead 2 Red"></div>').appendTo($base);

    $('.tube').click(function(){
        $('.tube').removeClass('selected');
        $(this).addClass('selected');

        var val = $(this).attr('data-display');
        ta.presets[currentPreset].components.tube.setValue(val);
    });

    var $switch1 = $('<div id="switch1" class="switch" data-display="SW1"></div>').appendTo($base);
    var $switch2 = $('<div id="switch2" class="switch" data-display="SW2"></div>').appendTo($base);
    var $switch3 = $('<div id="switch3" class="switch" data-display="SW3"></div>').appendTo($base);
    var $switch4 = $('<div id="switch4" class="switch" data-display="SW4"></div>').appendTo($base);

    $('.switch').click(function(){
        $(this).toggleClass('selected');

        ta.presets[currentPreset].components.fxSwitches.setSwitch($(this).attr('data-display'), $(this).hasClass('selected'));
    });

    var $fx = $('<div id="fx" class="fx"></div>').appendTo($base);

    $fx.click(function(){
        $(this).toggleClass('selected');

        ta.presets[currentPreset].components.fxSwitches.setFx($(this).hasClass('selected'));
    });

    var renderPreset = function(preset){
        $preset.html($('<div class="lcd"/>').html(preset+1));

        $gain.html($('<div class="lcd"/>').html(ta.presets[preset].components.gain.value.display));
        $treble.html($('<div class="lcd"/>').html(ta.presets[preset].components.treble.value.display));
        $middle.html($('<div class="lcd"/>').html(ta.presets[preset].components.middle.value.display));
        $bass.html($('<div class="lcd"/>').html(ta.presets[preset].components.bass.value.display));
        $lead1Drive.html($('<div class="lcd"/>').html(ta.presets[preset].components.lead1Drive.value.display));
        $lead2Drive.html($('<div class="lcd"/>').html(ta.presets[preset].components.lead2Drive.value.display));
        $master.html($('<div class="lcd"/>').html(ta.presets[preset].components.master.value.display));
        $presence.html($('<div class="lcd"/>').html(ta.presets[preset].components.presence.value.display));
        $dVoice.html($('<div class="lcd"/>').html(ta.presets[preset].components.dVoice.value.display));

        var $tubes = $('.tube');
        $tubes.removeClass('selected');

        $tubes.each(function(){
            if(ta.presets[preset].components.tube.value.display == $(this).attr('data-display')){
                $(this).addClass('selected');
            }
        });

        var $switches = $('.switch');
        $switches.removeClass('selected');

        $switches.each(function(){
            if(ta.presets[preset].components.fxSwitches[sprintf("switch%dValue", $(this).attr('data-display').substr(2))] != 0x00){
                $(this).addClass('selected');
            }
        });

        var $fx = $('#fx');
        $fx.removeClass('selected');

        if(ta.presets[preset].components.fxSwitches.fxValue != 0x00){
            $fx.addClass('selected');
        }
    };

    renderPreset(currentPreset);
}