var mapAlta = null;
var posAlta = '';
var sDireccionAlta = '';
var sFoto = '';

// -------- FOTO -------------------------------------------------------------------------
function hacerFoto() {
    iniciaMapaAlta(false);
    try {
        navigator.camera.getPicture(hacerfotoOK, hacerFotoERROR, { quality: 50, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.CAMERA, encodingType: Camera.EncodingType.JPEG, saveToPhotoAlbum: false });
    }
    catch (e) {
        alert('Exception : ' + e.message);
    }
}

function hacerfotoOK(imageData) {
    var imagen = document.getElementById('imgFoto');
    imagen.style.display = 'block';
    sFoto = imageData;
    imagen.src = "data:image/jpeg;base64," + sFoto;
}

function hacerFotoERROR(error) {
    mensaje('Cap foto caprutada !  ' + error.code);
}

function zoomFoto(){
    var imagen = document.getElementById('imgZoomFoto');
    imagen.style.display = 'block';
    imagen.src = "data:image/jpeg;base64," + sFoto;
    abrirPagina('pageZoomFoto');
}

function eliminarFoto(){
    sFoto = '';

    var imagen = document.getElementById('imgFoto');
    imagen.style.display = 'block';
    imagen.src = sFoto;

    imagen = document.getElementById('imgZoomFoto');
    imagen.style.display = 'block';
    imagen.src = sFoto;
}

// -------- LOCALIZACIÓN -----------------------------------------------------------------------
function iniciaMapaAlta(bAbrir) {
    var mapOptions = {
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapAlta = new google.maps.Map(document.getElementById('divMapaAlta'), mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            posAlta = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            sDireccionAlta = cogerDireccion(posAlta);

            var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">reportar incidència en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDireccionAlta + '</td></tr></table></div>';
            nuevaInfoWindowSobrePlano(mapAlta, posAlta, sTxt, 300);

            nuevoMarcadorSobrePlano(mapAlta,posAlta,sDireccionAlta);

            mapAlta.setCenter(posAlta);

            $('#labelDireccion').text(sDireccionAlta);

            $('#divMapaAlta').gmap('refresh');

            if (!bAbrir) $('#collapsibleLocalizacion').trigger('collapse');

        }, function () { getCurrentPositionError(true); });
    } else {
        // Browser no soporta Geolocation
        getCurrentPositionError(false);
    }
}

// -------- ENVIAR INCIDENCIA -----------------------------------------------------------------------
function enviarIncidencia() {
    var sObs = $('#textareaComentari').val();
    var sCoord = posAlta.toString().replace(" ", "").replace("(","").replace(")","")

    try
    {
        //BD local :
        //[ "ID", "REFERENCIA", "ESTAT", "DATA", "CARRER", "NUM", "COORD_X", "COORD_Y", "COMENTARI", "FOTO1" , "FOTO2", "FOTO3" ]
        var fila = [0,"REF000000","E","29/06/2013","C. ARIBAU","213", sCoord.split(",")[0] , sCoord.split(",")[1] ,sObs,sFoto,"","" ];
        //alert(fila);
        //var filaInsertada = db.catalog.getTable("COMUNICATS").insertRow(fila);

        // NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON
        var idCiutada = 0;
        var nom='';
        var cognom1='';
        var cognom2='';
        var dni='';
        var email='';
        var telefon='';

        var objUsu = getDatosUsuario();

        if(objUsu == null) alert("antes insert/upd : Error consultant dades de l'usuari");

        if($('#inputNOM').val() != '')     nom =     $('#inputNOM').val();     else nom =     objUsu['NOM'] + '';
        if($('#inputCOGNOM1').val() != '') cognom1 = $('#inputCOGNOM1').val(); else cognom1 = objUsu['COGNOM1'] + '';
        if($('#inputCOGNOM2').val() != '') cognom2 = $('#inputCOGNOM2').val(); else cognom2 = objUsu['COGNOM2'] + '';
        if($('#inputDNI').val() != '')     dni =     $('#inputDNI').val();     else dni =     objUsu['DNI'] + '';
        if($('#inputEMAIL').val() != '')   email=    $('#inputEMAIL').val();   else email =   objUsu['EMAIL'] + '';
        if($('#inputTELEFON').val() != '') telefon = $('#inputTELEFON').val(); else telefon = objUsu['TELEFON'] + '';

        fila = [idCiutada, nom , cognom1, cognom2,  dni, email , telefon];

        var filaInsertada = null;

        if(objUsu != null) {
            filaInsertada = db.catalog.getTable("CIUTADA").updateRow(fila);
        }
        else
        {
            filaInsertada = db.catalog.getTable("CIUTADA").insertRow(fila);
        }

        if(filaInsertada == 1)
            db.commit();
        else
            alert('Actualització correcta');

        objUsu = getDatosUsuario();
        if(objUsu == null)
            alert("despues insert/upd : Error consultant dades de l'usuari");

    }
    catch (e)
    {
        alert('Error : ' + e);
    }

    var sParam  = "sObs=" + sObs;
    sParam += "&sCoord=" + sCoord;
    sParam += "&sDir=" + sDireccionAlta;
    sParam += "&sFoto=" + sFoto;
    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidencia";

    try
    {
        // function LlamaWebService(sTipoLlamada,sUrl,   sParametros,sContentType,                      bCrossDom, sDataType, bProcData, bCache, nTimeOut, funcion,        pasaParam, asincro, bProcesar, tag)
        var datos = LlamaWebService('GET',       llamaWS,sParam,    'application/x-www-form-urlencoded',true,      'xml',     false,     false,  10000,    resultadoEnvio, null,      false,   false,     null);
    }
    catch (e)
    {
        mensaje('ERROR (exception) en enviarIncidencia : \n' + e.code + '\n' + e.message);
    }
}

function resultadoEnvio(resultado, param){
    if (global_AjaxERROR != '' || global_AjaxRESULTADO == null) {

        //mensaje(global_AjaxERROR);

// Descapar para pruebas en PC  -----------------
        eliminarFoto();
        limpiaVariables('pageNuevaIncidencia');
        mensaje('Incidència notificada' + '\n' + 'Gràcies per la seva col·laboració');
        abrirPagina('pageIndex');

    }
    else
    {
        eliminarFoto();
        limpiaVariables('pageNuevaIncidencia');
        mensaje('Incidència notificada' + '\n' + 'Gràcies per la seva col·laboració');
        abrirPagina('pageIndex');
    }
}

