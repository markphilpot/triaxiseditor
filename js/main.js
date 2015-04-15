$(function(){

    $("#file").change(function(e){
        var f = e.target.files[0];

        var reader = new FileReader();

        reader.onloadend = function(){
            var ta = new TriAxisSysEx();
            ta.init(reader.result);

            ta.download();
            //ta.compile();
        };
        reader.readAsArrayBuffer(f);



    });

});