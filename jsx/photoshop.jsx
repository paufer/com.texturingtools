function addDocument() {
    //app.documents.add();
    alert("hola");
    console.log("hola2");
}

function getDocName(){
    return app.documents.length ? app.activeDocument.name : "No docs open!";
}

function offsetHalf() {
    try {
        activeDoc = app.activeDocument;
        app.preferences.rulerUnits = Units.PIXELS;
        activeDoc.activeLayer.applyOffset(activeDoc.width/2,activeDoc.height/2,OffsetUndefinedAreas.WRAPAROUND);

        return 1;
    }catch(err) {
        return err;
    }
}

function equalizeImage(valueEqualize){
    try {
        activeDoc = app.activeDocument;
        app.preferences.rulerUnits = Units.PIXELS;
        //activeDoc.layers[1].applyAverage();
        //docRef.layers["Layer 1"]

        activeDoc.activeLayer.duplicate(activeDoc.activeLayer,ElementPlacement.PLACEAFTER).applyAverage();
        activeDoc.activeLayer.opacity=50;
        activeDoc.activeLayer.blendMode  = BlendMode.LINEARLIGHT;
        activeDoc.activeLayer.applyHighPass = valueEqualize;

        /*
        app.load(new File(extensionRoot+"/actions/TexturingTools.atn"));
        app.doAction("Equalize_100","TexturingTools");
        */
        return 1;
    }catch(err) {
        return err;
    }
}

function createMaps(extensionRoot){
    try {
        var Script1 = File(extensionRoot + "/jsx/NormalToAO.jsx");
        $.evalFile (Script1);
        return 1;
    }catch(err) {
        return err;
    }
}
