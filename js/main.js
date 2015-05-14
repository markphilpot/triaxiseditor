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

            $("#triaxis").html("");

            render();
        };
        reader.readAsArrayBuffer(f);
    });

    $('#download').click(function(){
        ta.download();
    });

    $('#preset-matrix').click(function(){
        var $dialog = $('<div class="matrix"/>').appendTo($('body'));

        var $table = $('<table/>').appendTo($dialog);

        var dt = $table.DataTable({
            paging: false,
            info: false,
            searching: false,
            scrollY: "100%",
            columns: [
                {title: 'Preset'},
                {title: 'Gain'},
                {title: 'Treble'},
                {title: 'Middle'},
                {title: 'Bass'},
                {title: 'L1 Drive'},
                {title: 'L2 Drive'},
                {title: 'Master'},
                {title: 'Presence'},
                {title: 'Dyn Voice'},
                {title: 'Tube'},
                {title: 'S1'},
                {title: 'S2'},
                {title: 'S3'},
                {title: 'S4'},
                {title: 'FX Loop'}
            ]
        });

        for(var i = 0; i < NUM_PRESETS; i++){
            dt.row.add([
                i+1,
                ta.presets[i].components.gain.value.display,
                ta.presets[i].components.treble.value.display,
                ta.presets[i].components.middle.value.display,
                ta.presets[i].components.bass.value.display,
                ta.presets[i].components.lead1Drive.value.display,
                ta.presets[i].components.lead2Drive.value.display,
                ta.presets[i].components.master.value.display,
                ta.presets[i].components.presence.value.display,
                ta.presets[i].components.dVoice.value.display,
                ta.presets[i].components.tube.value.display,
                ta.presets[i].components.fxSwitches.switch1Value == 0 ? "Off" : "On",
                ta.presets[i].components.fxSwitches.switch2Value == 0 ? "Off" : "On",
                ta.presets[i].components.fxSwitches.switch3Value == 0 ? "Off" : "On",
                ta.presets[i].components.fxSwitches.switch4Value == 0 ? "Off" : "On",
                ta.presets[i].components.fxSwitches.fxValue == 0 ? "Off" : "On"
            ]);
        }

        dt.draw();

        $table.find('tbody').on('click', 'td', function(){
            var cell = dt.cell(this);
            var $this = $(cell.node());

            var currentPreset = cell.index().row;

            var knobs = ["", "gain", "treble", "middle", "bass", "lead1Drive", "lead2Drive", "master", "presence", "dVoice"];

            var knob = knobs[cell.index().column];

            if(cell.index().column > 0 && cell.index().column < 10){

                if($dialog.find('.dropdown').length){
                    $dialog.find('.dropdown').remove();
                    return;
                }

                var $wrapper = $('<div class="dropdown"/>').appendTo($dialog);

                var pos = $this.position();

                //$wrapper.css({'top': pos.top+$this.height(), 'left': pos.left, 'width': $this.width()+2});
                $wrapper.css({'top': pos.top+$this.height(), 'left': pos.left});

                var setting = new Setting(0);
                for(var i = 0; i < setting.settings.length; i++){
                    $(sprintf('<div class="dropdown_value %s" value="%s">%s</div>',
                        ta.presets[currentPreset].components[knob].value.display == setting.settings[i].display ? "selected" : "",
                        setting.settings[i].display,
                        setting.settings[i].display)).appendTo($wrapper);
                }

                $('.dropdown_value').click(function(){
                    var val = $(this).attr('value');
                    $wrapper.remove();
                    ta.presets[currentPreset].components[knob].setValue(val);
                    cell.data(ta.presets[currentPreset].components[knob].value.display);
                });
            } else if(cell.index().column == 10){
                // Tube
                if($dialog.find('.dropdown').length){
                    $dialog.find('.dropdown').remove();
                    return;
                }

                var $wrapper = $('<div class="dropdown"/>').appendTo($dialog);

                var pos = $this.position();

                //$wrapper.css({'top': pos.top+$this.height(), 'left': pos.left, 'width': $this.width()+2});
                $wrapper.css({'top': pos.top+$this.height(), 'left': pos.left});

                var setting = new Tube(0);
                for(var i = 0; i < setting.settings.length; i++){
                    $(sprintf('<div class="dropdown_value %s" value="%s">%s</div>',
                        ta.presets[currentPreset].components.tube.value.display == setting.settings[i].display ? "selected" : "",
                        setting.settings[i].display,
                        setting.settings[i].display)).appendTo($wrapper);
                }

                $('.dropdown_value').click(function(){
                    var val = $(this).attr('value');
                    $wrapper.remove();
                    ta.presets[currentPreset].components.tube.setValue(val);
                    cell.data(ta.presets[currentPreset].components.tube.value.display);
                });
            } else if(cell.index().column > 10 && cell.index().column < 15){
                // Switches
                var sw = cell.index().column - 10;

                var s = new FxSwitches();

                if(sw == 1){
                    ta.presets[currentPreset].components.fxSwitches.switch1Value = (cell.data() == "On") ? s.SW_OFF : s.SW1;
                    cell.data(ta.presets[currentPreset].components.fxSwitches.switch1Value == s.SW_OFF ? "Off" : "On");
                } else if(sw == 2){
                    ta.presets[currentPreset].components.fxSwitches.switch2Value = (cell.data() == "On") ? s.SW_OFF : s.SW2;
                    cell.data(ta.presets[currentPreset].components.fxSwitches.switch2Value == s.SW_OFF ? "Off" : "On");
                } else if(sw == 3){
                    ta.presets[currentPreset].components.fxSwitches.switch3Value = (cell.data() == "On") ? s.SW_OFF : s.SW3;
                    cell.data(ta.presets[currentPreset].components.fxSwitches.switch3Value == s.SW_OFF ? "Off" : "On");
                } else if(sw == 4){
                    ta.presets[currentPreset].components.fxSwitches.switch4Value = (cell.data() == "On") ? s.SW_OFF : s.SW4;
                    cell.data(ta.presets[currentPreset].components.fxSwitches.switch4Value == s.SW_OFF ? "Off" : "On");
                }
            } else if(cell.index().column == 15){
                // FX
                ta.presets[currentPreset].components.fxSwitches.fxValue = (cell.data() == "On") ? 0 : 1;
                cell.data(ta.presets[currentPreset].components.fxSwitches.fxValue == 0 ? "Off" : "On");
            }

        });

        $dialog.on('dialogopen dialogresize', function(e){
            dt.columns.adjust().draw();
        });

        $dialog.dialog({
            title: 'Preset Matrix',
            autoOpen: true,
            closeOnEscape: true,
            width: '90%',
            height: 600,
            buttons: [
                {
                    text: "Close",
                    click: function(){

                        $dialog.dialog('close');

                    }
                }
            ]
        });

        $dialog.on('dialogclose', function(e){
            $dialog.remove();
            $(document).trigger('matrix:change', [{}]);
        });
    });

});

function render(){
    var currentPreset = 0;
    var currentProgram = -1;

    var $base = $('#triaxis');
    var $preset = $('<div id="preset" class="component"></div>').appendTo($base);

    $preset.click(function(){

        if($base.find('.dropdown').length){
            $base.find('.dropdown').remove();
            return;
        }

        var $wrapper = $('<div class="dropdown"/>').appendTo($base);

        var pos = $preset.position();

        $wrapper.css({'top': pos.top+$preset.height(), 'left': pos.left, 'width': $preset.width()+2});

        for(var i = 0; i < NUM_PRESETS; i++){
            $(sprintf('<div class="dropdown_value %s" value="%d">%d</div>', currentPreset == i ? 'selected"': "", i, i+1)).appendTo($wrapper);
        }

        $('.dropdown_value').click(function(){
            var val = $(this).attr('value');
            currentPreset = 1*val;
            if(currentProgram != -1){
                ta.programs[currentProgram].value = currentPreset;
            }
            $wrapper.remove();
            renderPreset(currentPreset);
        });
    });

    var $program = $('<div id="program" class="program component"></div>').appendTo($base);
    $program.html($('<div class="lcd"/>').html(currentProgram != -1 ? currentProgram+1 : "---"));

    $program.click(function(){

        if($base.find('.dropdown').length){
            $base.find('.dropdown').remove();
            return;
        }

        var $wrapper = $('<div class="dropdown"/>').appendTo($base);

        var pos = $program.position();

        $wrapper.css({'top': pos.top+$program.height(), 'left': pos.left, 'width': $program.width()+2});

        $(sprintf('<div class="dropdown_value %s" value="-1">---</div>', currentProgram == -1 ? 'selected"': "")).appendTo($wrapper);
        for(var i = 0; i < NUM_PROGRAMS; i++){
            $(sprintf('<div class="dropdown_value %s" value="%d">%d</div>', currentProgram == i ? 'selected"': "", i, i+1)).appendTo($wrapper);
        }

        $('.dropdown_value').click(function(){
            var val = $(this).attr('value');
            currentProgram = 1*val;
            if(currentProgram != -1){
                currentPreset = ta.programs[currentProgram].value;
            }
            $wrapper.remove();
            $program.html($('<div class="lcd"/>').html(currentProgram != -1 ? currentProgram+1 : "---"));
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

        if($base.find('.dropdown').length){
            $base.find('.dropdown').remove();
            return;
        }

        var $wrapper = $('<div class="dropdown"/>').appendTo($base);

        var pos = $this.position();

        $wrapper.css({'top': pos.top+$this.height(), 'left': pos.left, 'width': $this.width()+2});

        var setting = new Setting(0);
        for(var i = 0; i < setting.settings.length; i++){
            $(sprintf('<div class="dropdown_value %s" value="%s">%s</div>',
                ta.presets[currentPreset].components[$this.attr('data-knob')].value.display == setting.settings[i].display ? "selected" : "",
                setting.settings[i].display,
                setting.settings[i].display)).appendTo($wrapper);
        }

        $('.dropdown_value').click(function(){
            var val = $(this).attr('value');
            $wrapper.remove();
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

    $(document).on('matrix:change', function(data){
        renderPreset(currentPreset);
    });

    renderPreset(currentPreset);
}