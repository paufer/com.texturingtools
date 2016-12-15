function cTID(s){return charIDToTypeID(s)}
function sTID(s){return stringIDToTypeID(s)}
function tSID(s){return typeIDToStringID(s)}

ActionDescriptor.prototype.setLayerProperties = function(name, opacity, blendMode, useClippingMask) {
	var blendArray = [
		"Nrml", "Dslv", "Drkn", "Mltp", "CBrn", "linearBurn", "darkerColor", "Lghn", "Scrn", "CDdg", "linearDodge", "lighterColor",
		"Ovrl", "SftL", "HrdL", "vividLight", "linearLight", "pinLight", "hardMix", "Dfrn", "Xclu", "H   ", "Strt", "Clr ", "Lmns"
	];

	if(name != null) this.putString( cTID( "Nm  " ), name );
	if(opacity != null) this.putUnitDouble( cTID( "Opct" ), cTID( "#Prc" ), opacity );
	if(blendMode != null) this.putEnumerated( cTID( "Md  " ), cTID( "BlnM" ), cTID( blendMode ) );
	if(useClippingMask != null) this.putBoolean( cTID( "Grup" ), useClippingMask );
}

	main();


function main() {
	var normal = activeDocument.activeLayer;
	var ao = normalToAmbientOcclusion();
	ao = ao.merge();
	ao.blendMode = BlendMode.MULTIPLY;
	activeDocument.activeLayer = normal;
	var cavity = normalToCavity();
	cavity.blendMode = BlendMode.OVERLAY;
	cavity.move(ao, ElementPlacement.PLACEBEFORE);
}

function normalToCavity() {
	var m_Cavity = (activeDocument.activeLayer = activeDocument.activeLayer.duplicate(activeDocument.activeLayer, ElementPlacement.PLACEBEFORE));
	m_Cavity.name = "Calculating cavity. Please wait...";
	selectChannel("Rd  ");
	emboss(0, 1, 100);
	selectChannel("Grn ");
	emboss(90, 1, 100);
	applyImage(m_Cavity.name, 0, "overlay", false);
	selectChannel("RGB ");
	applyImage(m_Cavity.name, 1, "normal", false);
	m_Cavity.name = "Cavity \u00a9 teddy";

	return m_Cavity;
}

function selectChannel(charID) {
	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putEnumerated( cTID( "Chnl" ), cTID( "Chnl" ), cTID( charID ) );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );

	try {
		executeAction( cTID( "slct" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}

function emboss(angle, height, amount) {
	var m_Dsc01 = new ActionDescriptor();
	m_Dsc01.putInteger( cTID( "Angl" ), angle );
	m_Dsc01.putInteger( cTID( "Hght" ), height );
	m_Dsc01.putInteger( cTID( "Amnt" ), amount );

	try {
		executeAction( cTID( "Embs" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}

function normalToAmbientOcclusion() {
	var m_Nmap = activeDocument.activeLayer;
	activeDocument.activeLayer = activeDocument.layers[0];
	var m_ZColor = addAdjustments_SolidFill(false, null, null, "AO: #FFFFFF", 100, 255, 255, 255);

	constructAOElement(m_Nmap, 	180, 	[68,46,12], 	[130,100,8], 		[8, 25, 26], 		[15, 59, 70]	);
	constructAOElement(m_Nmap, 	0, 		[3,35,68], 		[17,92,113], 		[64,37,9], 			[138, 107, 13]	);
	constructAOElement(m_Nmap, 	90, 	[53,38,3], 		[79,68,40], 		[98,27,65], 		[137, 17, 17]	);
	constructAOElement(m_Nmap, 	-90, 	[99,2,2], 		[44,2,2], 			[67,101,19], 		[50, 182, 210]	);

	addToSelectionContinuous(m_ZColor.name);
	var aoMap = group("Ambient Occlusion \u00a9 teddy");
	//var aoMap = activeDocument.activeLayer.merge();
	//aoMap.blendMode = BlendMode.MULTIPLY;

	return aoMap;
}

function constructAOElement(normalmap, angle, shadowColorPrimary, shadowColorSecondary, bounceColorPrimary, bounceColorSecondary) { // creates initial
	activeDocument.activeLayer = normalmap.duplicate(activeDocument, ElementPlacement.PLACEATBEGINNING);
	flipNormal();
	var m_NarrowScatter = directionalBevel(angle);

	m_NarrowScatter.name = angle+": Narrow Scatter";
	castShadow(	shadowColorPrimary, 50, angle, 3, 0, 5, 0, false, "Linear", true);

	duplicateLayer(angle+": Edge Filler");
	castShadow(	[0,0,0], 25, angle, 1, 0, 1, 0, false, "Gaussian", true);

	duplicateLayer(angle+": Bevel Accent");
	castShadow(	null, null, null, null, null, null, null, null, null, null,
						[255,255,255], 0, bounceColorPrimary, 100, angle, 26, 75, 4, 4, "Linear", true,
						[0,0,0], 6, 19, 23, 250, true, true);

	duplicateLayer(angle+": Wide Scatter");
	castShadow(	shadowColorSecondary, 50, angle, 6, 0, 12, 0, true, "Linear", true,
						[255,255,255], 0, bounceColorSecondary, 62, angle, 30, 1, 5, 0, "Cove - Deep", true);

	addToSelectionContinuous(m_NarrowScatter.name);
	group(angle);
}

function directionalBevel(direction) {
	var m_ChnPrp;
	if(direction == 180) m_ChnPrp = [[0,0,100,0],[0,0,100,0],[0,0,100,0]];
	else if(direction == 0) m_ChnPrp = [[0,0,-100,100],[0,0,-100,100],[0,0,-100,100]];
	else if(direction == -90) m_ChnPrp = [[0,-100,0,100],[0,-100,0,100],[0,-100,0,100]];
	else if(direction == 90) m_ChnPrp = [[0,100,0,0],[0,100,0,0],[0,100,0,0]];

	var m_AL = activeDocument.activeLayer;
	m_AL.mixChannels(m_ChnPrp, false);
	m_AL.adjustLevels(128, 255, 1, 0, 255);

	overlayInverseRed();
	selectionFromRGB();
	addAdjustments_SolidFill(false, null, null, null, null, 0, 0, 0);
	m_AL.remove();

	return activeDocument.activeLayer;
}

function castShadow(
	shadowRGB, shadowOpacity, shadowAngle, shadowDistance, shadowSpread, shadowSize, shadowNoise, shadowAA, shadowContour, shadowConceal,
	bevelHRGB, bevelHOpacity, bevelSRGB, bevelSOpacity, bevelAngle, bevelAltitude, bevelDepth, bevelSize, bevelSoften, bevelContour, bevelAA,
	satinRGB, satinOpacity, satinAngle, satinDistance, satinSize, satinInvert, satinAA
) {

	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putProperty( cTID( "Prpr" ), cTID( "Lefx" ) );
	m_Ref01.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );
	var m_Dsc02 = new ActionDescriptor();
	m_Dsc02.putUnitDouble( stringIDToTypeID( "fillOpacity" ), charIDToTypeID( "#Prc" ), 0 );

	if(shadowRGB != null) {
		var m_Dsc03 = new ActionDescriptor();
		m_Dsc03.putBoolean( cTID( "enab" ), true );
		m_Dsc03.putEnumerated( cTID( "Md  " ), cTID( "BlnM" ), cTID( "Nrml" ) );
		var m_Dsc04 = new ActionDescriptor();
		m_Dsc04.putDouble( cTID( "Rd  " ), shadowRGB[0] );
		m_Dsc04.putDouble( cTID( "Grn " ), shadowRGB[1] );
		m_Dsc04.putDouble( cTID( "Bl  " ), shadowRGB[2] );
		m_Dsc03.putObject( cTID( "Clr " ), cTID( "RGBC" ), m_Dsc04 );
		m_Dsc03.putUnitDouble( cTID( "Opct" ), cTID( "#Prc" ), shadowOpacity );
		m_Dsc03.putBoolean( cTID( "uglg" ), false );
		m_Dsc03.putUnitDouble( cTID( "lagl" ), cTID( "#Ang" ), shadowAngle );
		m_Dsc03.putUnitDouble( cTID( "Dstn" ), cTID( "#Pxl" ), shadowDistance );
		m_Dsc03.putUnitDouble( cTID( "Ckmt" ), cTID( "#Pxl" ), shadowSpread );
		m_Dsc03.putUnitDouble( cTID( "blur" ), cTID( "#Pxl" ), shadowSize );
		m_Dsc03.putUnitDouble( cTID( "Nose" ), cTID( "#Prc" ), shadowNoise );
		m_Dsc03.putBoolean( cTID( "AntA" ), shadowAA );
		var m_Dsc05 = new ActionDescriptor();
		m_Dsc05.putString( cTID( "Nm  " ), shadowContour );
		m_Dsc03.putObject( cTID( "TrnS" ), cTID( "ShpC" ), m_Dsc05 );
		m_Dsc03.putBoolean( sTID( "layerConceals" ), shadowConceal );
		m_Dsc02.putObject( cTID( "DrSh" ), cTID( "DrSh" ), m_Dsc03 );
	}

	if(bevelHRGB != null) {
		var m_Dsc06 = new ActionDescriptor();
		m_Dsc06.putBoolean( cTID( "enab" ), true );
		m_Dsc06.putEnumerated( cTID( "hglM" ), cTID( "BlnM" ), cTID( "Scrn" ) );
		var m_Dsc07 = new ActionDescriptor();
		m_Dsc07.putDouble( cTID( "Rd  " ), bevelHRGB[0] );
		m_Dsc07.putDouble( cTID( "Grn " ), bevelHRGB[1] );
		m_Dsc07.putDouble( cTID( "Bl  " ), bevelHRGB[2] );
		m_Dsc06.putObject( cTID( "hglC" ), cTID( "RGBC" ), m_Dsc07 );
		m_Dsc06.putUnitDouble( cTID( "hglO" ), cTID( "#Prc" ), bevelHOpacity );
		m_Dsc06.putEnumerated( cTID( "sdwM" ), cTID( "BlnM" ), cTID( "Mltp" ) );
		var m_Dsc08 = new ActionDescriptor();
		m_Dsc08.putDouble( cTID( "Rd  " ), bevelSRGB[0] );
		m_Dsc08.putDouble( cTID( "Grn " ), bevelSRGB[1] );
		m_Dsc08.putDouble( cTID( "Bl  " ), bevelSRGB[2] );
		m_Dsc06.putObject( cTID( "sdwC" ), cTID( "RGBC" ), m_Dsc08 );
		m_Dsc06.putUnitDouble( cTID( "sdwO" ), cTID( "#Prc" ), bevelSOpacity );
		m_Dsc06.putEnumerated( cTID( "bvlT" ), cTID( "bvlT" ), cTID( "SfBL" ) );
		m_Dsc06.putEnumerated( cTID( "bvlS" ), cTID( "BESl" ), cTID( "InrB" ) );
		m_Dsc06.putBoolean( cTID( "uglg" ), false );
		m_Dsc06.putUnitDouble( cTID( "lagl" ), cTID( "#Ang" ), bevelAngle );
		m_Dsc06.putUnitDouble( cTID( "Lald" ), cTID( "#Ang" ), bevelAltitude );
		m_Dsc06.putUnitDouble( cTID( "srgR" ), cTID( "#Prc" ), bevelDepth );
		m_Dsc06.putUnitDouble( cTID( "blur" ), cTID( "#Pxl" ), bevelSize );
		m_Dsc06.putEnumerated( cTID( "bvlD" ), cTID( "BESs" ), cTID( "In  " ) );
		var m_Dsc09 = new ActionDescriptor();
		m_Dsc09.putString( cTID( "Nm  " ), bevelContour );
		m_Dsc06.putObject( cTID( "TrnS" ), cTID( "ShpC" ), m_Dsc09 );
		m_Dsc06.putBoolean( sTID( "antialiasGloss" ), bevelAA );
		m_Dsc06.putUnitDouble( cTID( "Sftn" ), cTID( "#Pxl" ), bevelSoften );
		m_Dsc06.putBoolean( sTID( "useShape" ), false );
		m_Dsc06.putBoolean( sTID( "useTexture" ), false );
		m_Dsc02.putObject( cTID( "ebbl" ), cTID( "ebbl" ), m_Dsc06 );
	}

	if(satinRGB != null) {
		var m_Dsc10 = new ActionDescriptor();
		m_Dsc10.putBoolean( cTID( "enab" ), true );
		m_Dsc10.putEnumerated( cTID( "Md  " ), cTID( "BlnM" ), cTID( "Mltp" ) );
		var m_Dsc11 = new ActionDescriptor();
		m_Dsc11.putDouble( cTID( "Rd  " ), satinRGB[0] );
		m_Dsc11.putDouble( cTID( "Grn " ), satinRGB[1] );
		m_Dsc11.putDouble( cTID( "Bl  " ), satinRGB[2] );
		m_Dsc10.putObject( cTID( "Clr " ), cTID( "RGBC" ), m_Dsc11 );
		m_Dsc10.putBoolean( cTID( "AntA" ), satinAA );
		m_Dsc10.putBoolean( cTID( "Invr" ), satinInvert );
		m_Dsc10.putUnitDouble( cTID( "Opct" ), cTID( "#Prc" ), satinOpacity );
		m_Dsc10.putUnitDouble( cTID( "lagl" ), cTID( "#Ang" ), satinAngle );
		m_Dsc10.putUnitDouble( cTID( "Dstn" ), cTID( "#Pxl" ), satinDistance );
		m_Dsc10.putUnitDouble( cTID( "blur" ), cTID( "#Pxl" ), satinSize );
		var m_Dsc12 = new ActionDescriptor();
		m_Dsc12.putString( cTID( "Nm  " ), "Linear" );
		m_Dsc10.putObject( cTID( "MpgS" ), cTID( "ShpC" ), m_Dsc12 );
		m_Dsc02.putObject( cTID( "ChFX" ), cTID( "ChFX" ), m_Dsc10 );
	}

	m_Dsc01.putObject( cTID( "T   " ), cTID( "Lefx" ), m_Dsc02 );

	try {
		executeAction( cTID( "setd" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}

function overlayInverseRed() {
	var m_Dsc01 = new ActionDescriptor();
	var m_Dsc02 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putEnumerated( cTID( "Chnl" ), cTID( "Chnl" ), cTID( "Rd  " ) );
	m_Ref01.putProperty( cTID( "Lyr " ), cTID( "Bckg" ) );
	m_Dsc02.putReference( cTID( "T   " ), m_Ref01 );
	m_Dsc02.putBoolean( cTID( "Invr" ), true );
	m_Dsc02.putEnumerated( cTID( "Clcl" ), cTID( "Clcn" ), cTID( "Ovrl" ) );
	m_Dsc02.putUnitDouble( cTID( "Opct" ), cTID( "#Prc" ), 50.000000 );
	m_Dsc01.putObject( cTID( "With" ), cTID( "Clcl" ), m_Dsc02 );

	try {
		executeAction( cTID( "AppI" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}

// ------------------------------------ GENERAL FUNCTIONALITY ------------------------------------ //

function applyImage(layerName, channelIndex, blendSTID, invert) {
	var cTIDArray = ["Rd  ", "Grn ", "Bl  ", "RGB "];

	var m_Dsc01 = new ActionDescriptor();
	var m_Dsc02 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putEnumerated( cTID( "Chnl" ), cTID( "Chnl" ), cTID(cTIDArray[channelIndex]) );
	m_Ref01.putName( cTID( "Lyr " ), layerName );
	m_Dsc02.putReference( cTID( "T   " ), m_Ref01 );
	m_Dsc02.putBoolean( cTID( "Invr" ), invert );
	m_Dsc02.putEnumerated( cTID( "Clcl" ), cTID( "Clcn" ), sTID( blendSTID ) );
	m_Dsc01.putObject( cTID( "With" ), cTID( "Clcl" ), m_Dsc02 );

	try {
		executeAction( cTID( "AppI" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}

function addAdjustments_SolidFill(dialog, blendMode, useClippingMask, name, opacity, r, g, b) {
	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putClass( sTID( "contentLayer" ) );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );
	var m_Dsc02 = new ActionDescriptor();
	m_Dsc02.setLayerProperties(name, opacity, blendMode, useClippingMask);
	var m_Dsc03 = new ActionDescriptor();
	var m_Dsc04 = new ActionDescriptor();
	if(r != null) m_Dsc04.putDouble( cTID( "Rd  " ), r );
	if(g != null) m_Dsc04.putDouble( cTID( "Grn " ), g );
	if(b != null) m_Dsc04.putDouble( cTID( "Bl  " ), b );
	m_Dsc03.putObject( cTID( "Clr " ), cTID( "RGBC" ), m_Dsc04 );
	m_Dsc02.putObject( cTID( "Type" ), sTID( "solidColorLayer" ), m_Dsc03 );
	m_Dsc01.putObject( cTID( "Usng" ), sTID( "contentLayer" ), m_Dsc02 );

	try {
		executeAction( cTID( "Mk  " ), m_Dsc01, DialogModes.NO );
	} catch(e) {}

	if(dialog) editAdjustments("solidColorLayer");

	return activeDocument.activeLayer;
}

function addToSelectionContinuous(layerName) {
	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putName( cTID( "Lyr " ), layerName );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );
	m_Dsc01.putEnumerated( sTID( "selectionModifier" ), sTID( "selectionModifierType" ), sTID( "addToSelectionContinuous" ) );
	m_Dsc01.putBoolean( cTID( "MkVs" ), false );

	try {
		executeAction( cTID( "slct" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}

function group(name, opacity) {
	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putClass( sTID( "layerSection" ) );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );
	var m_Dsc02 = new ActionDescriptor();
	m_Dsc02.putString( cTID( "Nm  " ), name );
	m_Dsc02.putUnitDouble( cTID( "Opct" ), cTID( "#Prc" ), (opacity == null ? 100 : opacity) );
	m_Dsc01.putObject( cTID( "Usng" ), sTID( "layerSection" ), m_Dsc02 );
	var m_Ref02 = new ActionReference();
	m_Ref02.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );
	m_Dsc01.putReference( cTID( "From" ), m_Ref02 );

	try {
		executeAction( cTID( "Mk  " ), m_Dsc01, DialogModes.NO );
	} catch(e) {}

	return activeDocument.activeLayer;
}

function flipNormal() {
	activeDocument.activeLayer.mixChannels([[0,0,100,0],[0,-100,0,100],[100,0,0,0]], false);
}

function duplicateLayer(name) {
	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );
	if(name != null) m_Dsc01.putString( cTID( "Nm  " ), name );
	m_Dsc01.putInteger( cTID( "Vrsn" ), 2 );

	try {
		executeAction( cTID( "Dplc" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}

	return activeDocument.activeLayer;
}

function selectionFromRGB() {
	var m_Dsc01 = new ActionDescriptor();
	var m_Ref01 = new ActionReference();
	m_Ref01.putProperty( cTID( "Chnl" ), cTID( "fsel" ) );
	m_Dsc01.putReference( cTID( "null" ), m_Ref01 );
	var m_Ref02 = new ActionReference();
	m_Ref02.putEnumerated( cTID( "Chnl" ), cTID( "Chnl" ), cTID( "RGB " ) );
	m_Dsc01.putReference( cTID( "T   " ), m_Ref02 );

	try {
		executeAction( cTID( "setd" ), m_Dsc01, DialogModes.NO );
	} catch(e) {}
}
