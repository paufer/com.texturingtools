(function () {
    'use strict';

    // Get a reference to a CSInterface object
    var csInterface = new CSInterface();
    console.log("csInterface loaded Correctly");
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION);

    /** Identifies the path to current extension.  */

    /*$("btnOffset").click(function(){
    alert("The paragraph was clicked.");
    csInterface.evalScript("addDocument()");
});*/

function loadJSX(filename) {
    var extensionPathJSX = extensionRoot + "/jsx/"
    csInterface.evalScript('$._ext.evalFiles("' + extensionPathJSX + '")');

}
function showResultText(result,textId){
    if(result == 1){
        $("#"+textId).text("Done!");
        $("#"+textId).addClass("text-success");
    }else {
        $("#"+textId).text(result);
        $("#"+textId).addClass("text-danger");
    }
}

function init() {

    //Boton Offset
    $("#btnOffset").click(function () {
        console.log("Botón Clicado: btnOffset");
        csInterface.evalScript('offsetHalf()', function(result) {
            showResultText(result,"OffsetText");
        });
    });
    //Boton Equalize
    $("#btnEqualize").click(function () {
        console.log("Botón Clicado: btnEqualize");
        csInterface.evalScript('equalizeImage("'+extensionRoot+'")', function(result) {
            showResultText(result,"EqualizeText");
        });
    });
    //Boton Offset
    $("#btnCreateMaps").click(function () {
        console.log("Botón Clicado: btnEqualize");
        csInterface.evalScript('createMaps("'+extensionRoot+'")', function(result) {
            showResultText(result,"CreateMapsText");
        });
    });
}
init();
}());
