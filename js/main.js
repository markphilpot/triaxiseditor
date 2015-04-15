var ta = new TriAxisSysEx();

$(function(){
    $.event.props.push('dataTransfer');

    //$("#file").change(function(e){
    //    var f = e.target.files[0];
    //
    //    var reader = new FileReader();
    //
    //    reader.onloadend = function(){
    //        var ta = new TriAxisSysEx();
    //        ta.init(reader.result);
    //
    //        ta.download();
    //        //ta.compile();
    //    };
    //    reader.readAsArrayBuffer(f);
    //
    //
    //
    //});

    var $drop = $('<div id="drop_zone">Drop .syx file here</div>').appendTo($("body"));

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

            $drop.remove();

            render();
        };
        reader.readAsArrayBuffer(f);
    });

});

function render(){
    var currentPreset = 0;

    var $base = $('<div id="triaxis"></div>').appendTo($("body"));
    var $preset = $('<div id="preset" class="component"></div>').appendTo($base);

    var $gain = $('<div id="gain" class="component"></div>').appendTo($base);

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
        })
    });

    var $tube_rhyGreen = $('<div id="tube_rhyGreen" class="tube"></div>').appendTo($base);
    var $tube_rhyYellow = $('<div id="tube_rhyYellow" class="tube"></div>').appendTo($base);

    var renderPreset = function(preset){
        $preset.html($('<div class="lcd"/>').html(preset+1));

        $gain.html($('<div class="lcd"/>').html(ta.presets[preset].components.gain.value.display));

        $('.tube').removeClass('selected');

        if(ta.presets[preset].components.tube.value.display == "Rhythm Green"){
            $tube_rhyGreen.addClass('selected');
        }
    };

    renderPreset(currentPreset);
}