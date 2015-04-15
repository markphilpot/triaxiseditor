
var SYSEX_NUM_BYTES = 2746;
var NUM_PRESETS = 90;
var NUM_PROGRAMS = 128;
var CONTROLLER_WIDTH = 1622; // Placeholder

var PREAMBLE = [0xF0, 0x00, 0x00, 0x4A, 0x02];
var TERMINATOR = [0xF7];

var PRESET_BYTES = 11;
var PROGRAM_BYTES = 1;

var PRESET_OFFSET = PREAMBLE.length;
var PROGRAM_OFFSET = PRESET_OFFSET + (PRESET_BYTES * NUM_PRESETS);
var CONTROLLERS_OFFSET = PROGRAM_OFFSET + (PROGRAM_BYTES * NUM_PROGRAMS);
var TERMINATOR_OFFSET = CONTROLLERS_OFFSET + CONTROLLER_WIDTH;

var FxSwitches = function(){
    this.FX_ON = 0x01;
    this.FX_OFF = 0x00;
    this.SW_OFF = 0x00;
    this.SW1 = 0x02;
    this.SW2 = 0x04;
    this.SW3 = 0x08;
    this.SW4 = 0x10;

    this.offset = 10;
    this.fxValue = this.FX_ON;
    this.switchValue = this.SW_OFF;
};
FxSwitches.prototype.compile = function(){
    return (this.fxValue | this.switchValue);
};
FxSwitches.prototype.init = function(arrayBuffer){
    var view = new DataView(arrayBuffer);
    var v = view.getUint8(0);

    this.fxValue = v & 0x01;
    this.switchValue = v & 0x1E;
};

var TubeValue = function(value, display){
    this.value = value;
    this.display = display;
};

var Tube = function(){
    this.RHYTHM_GREEN = new TubeValue(0x7E, "Rhythm Green");
    this.RHYTHM_YELLOW = new TubeValue(0x7D, "Rhythm Yellow");
    this.LEAD1_GREEN = new TubeValue(0x7B, "Lead 1 Green");
    this.LEAD1_YELLOW = new TubeValue(0x77, "Lead 1 Yellow");
    this.LEAD1_RED = new TubeValue(0x6F, "Lead 1 Red");
    this.LEAD2_GREEN = new TubeValue(0x5F, "Lead 2 Green");
    this.LEAD2_YELLOW = new TubeValue(0x3F, "Lead 2 Yellow");
    this.LEAD2_RED = new TubeValue(0x7F, "Lead 2 Red");
    this.settings = [this.RHYTHM_GREEN, this.RHYTHM_YELLOW, this.LEAD1_GREEN, this.LEAD1_YELLOW,
        this.LEAD1_RED, this.LEAD2_GREEN, this.LEAD2_YELLOW, this.LEAD2_RED];

    this.offset = 9;
    this.value = this.RHYTHM_GREEN;
};
Tube.prototype.compile = function(){
    return this.value.value;
};
Tube.prototype.init = function(arrayBuffer){
    var self = this;
    var view = new DataView(arrayBuffer);
    var v = view.getUint8(0);
    this.settings.forEach(function(e){
        if(v == e.value){
            self.value = e;
        }
    });
};

var SettingValue = function(value, display){
    this.value = value;
    this.display = display;
};

var Setting = function(offset){
    this.v00 = new SettingValue(0x00, "0.0");
    this.v10 = new SettingValue(0x01, "1.0");
    this.v20 = new SettingValue(0x02, "2.0");
    this.v30 = new SettingValue(0x03, "3.0");
    this.v35 = new SettingValue(0x04, "3.5");
    this.v40 = new SettingValue(0x05, "4.0");
    this.v45 = new SettingValue(0x06, "4.5");
    this.v50 = new SettingValue(0x07, "5.0");
    this.v55 = new SettingValue(0x08, "5.5");
    this.v60 = new SettingValue(0x09, "6.0");
    this.v65 = new SettingValue(0x0A, "6.5");
    this.v70 = new SettingValue(0x0B, "7.0");
    this.v75 = new SettingValue(0x0C, "7.5");
    this.v80 = new SettingValue(0x0D, "8.0");
    this.v90 = new SettingValue(0x0E, "9.0");
    this.v100 = new SettingValue(0x0F, "10.0");
    this.settings = [this.v00, this.v10, this.v20, this.v30, this.v35, this.v40, this.v45, this.v50, this.v55,
        this.v60, this.v65, this.v70, this.v75, this.v80, this.v90, this.v100];

    this.offset = offset;
    this.value = self.v00;
};
Setting.prototype.compile = function(){
    return this.value.value;
};
Setting.prototype.init = function(arrayBuffer){
    var self = this;
    var view = new DataView(arrayBuffer);
    var v = view.getUint8(0);
    this.settings.forEach(function(e){
        if(v == e.value){
            self.value = e;
        }
    });
};

var Preset = function(){
    this.components = {
        dVoice: new Setting(0),
        presence: new Setting(1),
        master: new Setting(2),
        lead2Drive: new Setting(3),
        lead1Drive: new Setting(4),
        bass: new Setting(5),
        middle: new Setting(6),
        treble: new Setting(7),
        gain: new Setting(8),
        tube: new Tube(),
        fxSwitches: new FxSwitches()
    };
};
Preset.prototype.compile = function(){
    var buffer = new Array(PRESET_BYTES);

    for(var key in this.components){
        buffer[this.components[key].offset] = this.components[key].compile();
    }

    return buffer;
};
Preset.prototype.init = function(arrayBuffer){
    for(var key in this.components){
        var begin = this.components[key].offset;
        var end = begin + 1;
        this.components[key].init(arrayBuffer.slice(begin, end));
    }
};

var Program = function(preset){
    this.value = preset;
};
Program.prototype.init = function(arrayBuffer){
    var view = new DataView(arrayBuffer);
    this.value = view.getUint8(0);
};
Program.prototype.compile = function(){
    return [this.value];
};

var TriAxisSysEx = function(){
    this.sysEx = new DataView(new ArrayBuffer(SYSEX_NUM_BYTES));
    this.presets = [];
    this.programs = [];

    for(var i = 0; i < NUM_PRESETS; i++){
        this.presets[i] = new Preset();
    }
    for(var i = 0; i < NUM_PROGRAMS; i++){
        this.programs[i] = new Program(i % NUM_PRESETS);
    }

};

TriAxisSysEx.prototype.init = function(arrayBuffer){

    for(var i = 0; i < NUM_PRESETS; i++){
        var begin = PRESET_OFFSET + (i*PRESET_BYTES);
        var end = begin + PRESET_BYTES;
        this.presets[i].init(arrayBuffer.slice(begin, end));
    }

    for(var i = 0; i < NUM_PROGRAMS; i++){
        var begin = PROGRAM_OFFSET + (i*PROGRAM_BYTES);
        var end = begin + PROGRAM_BYTES;
        this.programs[i].init(arrayBuffer.slice(begin, end));
    }

};

TriAxisSysEx.prototype.compile = function(){
    var self = this;

    PREAMBLE.forEach(function(e, i){
        self.sysEx.setUint8(i, e);
    });

    self.presets.forEach(function(p, index){
        var b = p.compile();
        b.forEach(function(e, i){
            self.sysEx.setUint8(PRESET_OFFSET + (index*PRESET_BYTES) + i, e);
        });
    });

    self.programs.forEach(function(p, index){
        var b = p.compile();
        b.forEach(function(e, i){
            self.sysEx.setUint8(PROGRAM_OFFSET + (index*PROGRAM_BYTES) + i, e);
        });
    });

    TERMINATOR.forEach(function(e, i){
        self.sysEx.setUint8(TERMINATOR_OFFSET+i, e);
    });

    return self.sysEx.buffer;
};

TriAxisSysEx.prototype.download = function(){
    var blob = new Blob([this.compile()], {type: "application/octet-stream"});
    saveAs(blob, "triaxis.syx");
};