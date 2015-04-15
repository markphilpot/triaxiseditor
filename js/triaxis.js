
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

var Tube = function(){
    this.RHYTHM_GREEN = [0x7E];

    this.offset = 9;
    this.value = this.RHYTHM_GREEN;
};

var SettingValue = function(value, display){
    this.value = value;
    this.display = display;
};

var Setting = function(offset){
    this.v00 = new SettingValue([0x00], "0.0");

    this.offset = offset;
    this.value = self.v00;
};
Setting.prototype.compile = function(){

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
        switches: new Switches(),
        fx: new Fx()
    };
};
Preset.prototype.compile = function(){
};

var TriAxisSysEx = function(){
    this.sysEx = new DataView(new ArrayBuffer(SYSEX_NUM_BYTES));
    this.presets = [];
    this.programs = [];
};

TriAxisSysEx.prototype.init = function(file){

};

TriAxisSysEx.prototype.compile = function(){
    var self = this;

    PREAMBLE.forEach(function(e, i){
        self.sysEx.setUint8(i, e);
    });

    //self.presets.forEach(function(p){
    //    var b = p.compile();
    //    b.forEach(function(e, i){
    //        self.sysEx.setUint8((i*PRESET_BYTES)+PREAMBLE.length, e);
    //    });
    //});

    TERMINATOR.forEach(function(e, i){
        self.sysEx.setUint8(TERMINATOR_OFFSET+i, e);
    });

    return self.sysEx.buffer;
};

TriAxisSysEx.prototype.download = function(){
    var blob = new Blob([this.compile()], {type: "application/octet-stream"});
    saveAs(blob, "triaxis.syx");
};