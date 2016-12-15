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
    }catch(err) {
        return err;
    }
    return "Done!";
}

function equalizeImage(extensionRoot){
    try {
        //$.evalFile(extensionRoot);
        activeDoc = app.activeDocument;
        app.preferences.rulerUnits = Units.PIXELS;
/*
        var layerRef = activeDoc.layers[0];
        activeDoc.layers[0].duplicate(activeDoc.layers[0],ElementPlacement.PLACEBEFORE);
        activeDoc.layers[1].applyAverage();
        activeDoc.activeLayer = activeDoc.layers[0];
        activeDoc.activeLayer.opacity=50;
        activeDoc.activeLayer.blendMode  = BlendMode.LINEARLIGHT;

*/
        app.load(new File(extensionRoot+"/actions/TexturingTools.atn"));
        app.doAction("Equalize_100","TexturingTools");


        //activeDoc.artLayers[1].applyAverage();
        //doc.layers[0].move(doc.activeLayer, ElementPlacement.PLACEAFTER)
        //activeDoc.activeLayer = doc.layers[1];
        //activeDoc.activeLayer.opacity= 50;
        //docRef.layers["Layer 1"]


        /*var layerRef = doc.layers[0];
        layerRef.move(duplicatedLayer, ElementPlacement.PLACEAFTER)*/



    }catch(err) {
        return err;
    }
    return extensionRoot;
}
