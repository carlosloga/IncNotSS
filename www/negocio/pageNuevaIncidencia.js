var mapAlta = null;
var posAlta = '';
var sDireccionAlta = '';
var sFoto = '';
var sCoord_X = '';
var sCoord_Y = '';
var sComentario = '';

// -------- INICIALIZAR PÁGINA -----------------------------------------------------------
function inicioPaginaNuevaIncidencia(){
    //cargar los datos del usuario (tabla CIUTADA si tiene datos)
    cargaDatosCiudadano();

    //cargar CARRERS en el combo
    cargaCalles();

    //iniciar el plano
    iniciaMapaAlta(true);

    setTimeout(cierraMapaAbreComentario,1000);
}

function cargaDatosCiudadano(){
    var objUsu = getDatosUsuario();
    if(objUsu != null)
    {
        $('#inputNOM').val(objUsu.NOM) ;
        $('#inputCOGNOM1').val(objUsu.COGNOM1);
        $('#inputCOGNOM2').val(objUsu.COGNOM2);
        $('#inputDNI').val(objUsu.DNI);
        $('#inputEMAIL').val(objUsu.EMAIL);
        $('#inputTELEFON').val(objUsu.TELEFON);

        $('#labelQUISOC').text(objUsu.NOM + ' ' + objUsu.COGNOM1 + ' ' + objUsu.COGNOM2 );
    }
}

function cargaCalles(){
    var aCalles = getCarrers();
    if(aCalles == null)
        mensaje("No s'han trobat carrers","informació");
    else
    {
        $('#selectCARRER').children().remove('li');
        $('#selectCARRER').empty();
        $('#selectCARRER').children().remove();

        var calles = [];
        calles.push("<option value='-1' data-placeholder='true'>Seleccioni el carrer</option>");
        for (var x = 0; x < aCalles.length; x++)
        {
            calles.push("<option value='" + aCalles[x].ID + "'>" + aCalles[x].CARRER + " (" +  aCalles[x].TIPUS + ")</option>");
        }
        $('#selectCARRER').append(calles.join('')).selectmenu('refresh');
    }
}

function autoRellenoCalleNum(){
    if(sDireccionAlta == '' || aGlobalCarrers == null || aGlobalCarrers.length < 1) return;

    try{
        var sTipusDetectat = sDireccionAlta.split(" ")[0];
        var sCarrerDetectat = sDireccionAlta.split(",")[0].substr(sTipusDetectat.length);
        var sIdCarrer = "";

        for(var x=0 ; x<aGlobalCarrers.length; x++)
        {
            if(aGlobalCarrers[x].CARRER.trim().toUpperCase() == sCarrerDetectat.trim().toUpperCase())
                if(aGlobalCarrers[x].TIPUS.trim().toUpperCase() == sTipusDetectat.trim().toUpperCase())
                    sIdCarrer = aGlobalCarrers[x].ID;
        }
        if(sIdCarrer != "") {
            $('#inputNUM').val(sDireccionAlta.split(",")[1].trim());
            $('#selectCARRER').text(sCarrerDetectat);
            $('#selectCARRER').val(sIdCarrer)._refresh();
        }
    }
    catch(e){}

    //$('option[value=' + sIdCarrer + ']').attr('selected', 'selected');
}

function cierraMapaAbreComentario(){
    $('#collapsibleLocalizacion').trigger('collapse');
    $('#collapsibleComentario').trigger('expand');
}

// -------- FOTO -------------------------------------------------------------------------
function hacerFoto() {
    iniciaMapaAlta(false);
    try {
        navigator.camera.getPicture(hacerfotoOK, hacerFotoERROR, { quality: 20, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.CAMERA, encodingType: Camera.EncodingType.JPEG, saveToPhotoAlbum: false });
    }
    catch (e) {
        mensaje('Exception : ' + e.message);
    }
}

function hacerfotoOK(imageData) {
    var imagen = document.getElementById('imgFoto');
    imagen.style.display = 'block';
    sFoto = imageData;
    imagen.src = "data:image/jpeg;base64," + sFoto;
}

function hacerFotoERROR(errorOcancel) {
    sFoto = '';
    if(errorOcancel != null && (errorOcancel.indexOf('cancelled') < 0 && errorOcancel.indexOf('selected') < 0)){
        mensaje('Cap foto caprutada : ' + errorOcancel.code);
    }
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

            //Crear el evento click sobre el mapa
            //si bActualizarControlesManualesCalleNum = true, se llama a autoRellenoCalleNum()
            //crearMarcadorEventoClick(map,     bSoloUnMarcadorSobreMapa , labelMostrarDir, bActualizarControlesManualesCalleNum)
            crearMarcadorEventoClick(mapAlta, true,'labelDireccion', true);

            posAlta = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            sDireccionAlta = cogerDireccion(posAlta);

            var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">reportar incidència en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDireccionAlta + '</td></tr></table></div>';

          //nuevoMarcadorSobrePlanoClickInfoWindow(mapa,    pos,    htmlText, nMaxAncho, bMostrarBocataDeInicio, bSoloUnMarcadorSobreMapa)
            nuevoMarcadorSobrePlanoClickInfoWindow(mapAlta, posAlta,sTxt,     300,       true,                   true);

            mapAlta.setCenter(posAlta);

            $('#labelDireccion').text(cogerCalleNumDeDireccion(sDireccionAlta));

            $('#divMapaAlta').gmap('refresh');

        }, function () { getCurrentPositionError(true); });
    } else {
        // Browser no soporta Geolocation
        getCurrentPositionError(false);
    }
}

// -------- NETEJAR CIUTADA -------------------------------------------------------------------
function netejarDades(){
    $('#inputNOM').val('');
    $('#inputCOGNOM1').val('');
    $('#inputCOGNOM2').val('');
    $('#inputDNI').val('');
    $('#inputEMAIL').val('');
    $('#inputTELEFON').val('');
    $('#collapsibleQuiSoc').trigger('collapse');
}

// -------- ENVIAR INCIDENCIA -----------------------------------------------------------------
function enviarIncidencia() {
    var sCoord = posAlta.toString().replace(" ", "").replace("(","").replace(")","");
    sComentario = $('#textareaComentari').val();

    if(sCoord != null && sCoord.trim() != '')
    {
        sCoord_X = sCoord.split(",")[0];
        sCoord_Y = sCoord.split(",")[1];
    }

    guardaDatosCiudadano();

    // La dirección correcta es la que ponga en el combo de calle y el numero de calle
    // ( ya que puede pasar que la que ha detectado google maps no sea correcta)
    if( indefinidoOnullToVacio($('#selectCARRER').val()) != '' && $('#selectCARRER').val() != '-1') //o sea, si han seleccionado una calle en el combo ...
    {
        sDireccionAlta = $('#selectCARRER').find(":selected").text() + ', ' + $('#inputNUM').val();
    }



    //Controlar datos obligatorios
    if(!datosObligatorios(sComentario, sDireccionAlta)){
        mensaje('Les dades marcades amb (*) són obligatòries','Atenció');
        return;
    }

    var sParam = "";
    sParam += "sNom=" + $('#inputNOM').val() + '';
    sParam += "&sCognom1=" + $('#inputCOGNOM1').val() + '';
    sParam += "&sCognom2=" + $('#inputCOGNOM2').val() + '';
    sParam += "&sDni=" + $('#inputDNI').val() + '';
    sParam += "&sEmail=" + $('#inputEMAIL').val() + '';
    sParam += "&sTelefon=" + $('#inputTELEFON').val() + '';
    sParam += "&sObs=" + sComentario + '';
    sParam += "&sCoord=" + sCoord + '';
    sParam += "&sDir=" + sDireccionAlta + '';
    sParam += "&sFoto=" + sFoto + '';

    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidencia";
  //var llamaWS = "http://172.26.0.2:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidencia";
    try
    {
        // function LlamaWebService(sTipoLlamada,sUrl,   sParametros,sContentType,                      bCrossDom, sDataType, bProcData, bCache, nTimeOut, funcion,        pasaParam, asincro, bProcesar, tag)
        global_AjaxERROR = '';
        var datos = LlamaWebService('POST',       llamaWS,sParam,    'application/x-www-form-urlencoded',true,      'xml',     false,     false,  10000,    resultadoEnvio, null,      false,    false,     null);
    }
    catch(e)
    {
        mensaje('ERROR (exception) en enviarIncidencia : \n' + e.code + '\n' + e.message);
    }
}

function resultadoEnvio(resultado, param){
    try{
        if (global_AjaxERROR != '' || global_AjaxRESULTADO == null) {
            mensaje(global_AjaxERROR);

            // Descapar para pruebas en PC  -----------------
            var sReferen = 'EUDLC20130710885H';
            guardaIncidencia(sReferen);

            eliminarFoto();
            limpiaVariables('pageNuevaIncidencia');
            mensaje('Incidència notificada' + '\n' + 'Gràcies per la seva col·laboració');
            abrirPagina('pageIndex');
        }
        else
        {
            //ATENCIÓN !!!!!!!!!!!!!!!! hay que recoger bien este valor devuelto por el WS  !!!!!!!!!!!!!!!!!!!!!!
            //var sRef = global_AjaxRESULTADO[0];
            sRef = "EUDLC000000000000";

            guardaIncidencia(sRef);

            eliminarFoto();
            limpiaVariables('pageNuevaIncidencia');
            mensaje('Incidència notificada' + '\n' + 'Gràcies per la seva col·laboració');
            abrirPagina('pageIndex');
        }
    }
    catch(e)
    {
        mensaje('ERROR (exception) en resultadoEnvio : \n' + e.code + '\n' + e.message);
    }
}

function guardaDatosCiudadano(){
    try
    {
        // NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON
        var idCiutada = 0;
        var nom='';
        var cognom1='';
        var cognom2='';
        var dni='';
        var email='';
        var telefon='';

        //recojo los datos del usuario que ya están guardados en la tabla CIUTADA
        //si todavía no existe el usuario se devuelve un objeto usuari vacio
        var objUsu = getDatosUsuario();

        //Si ha modificado algún dato lo recojo para actualizar , pero si lo ha dejado en blanco cojo lo que ya tenía en la tabla guardado
        if($('#inputNOM').val() != '')     nom =     $('#inputNOM').val();     else nom =     objUsu.NOM;
        if($('#inputCOGNOM1').val() != '') cognom1 = $('#inputCOGNOM1').val(); else cognom1 = objUsu.COGNOM1 ;
        if($('#inputCOGNOM2').val() != '') cognom2 = $('#inputCOGNOM2').val(); else cognom2 = objUsu.COGNOM2 ;
        if($('#inputDNI').val() != '')     dni =     $('#inputDNI').val();     else dni =     objUsu.DNI ;
        if($('#inputEMAIL').val() != '')   email=    $('#inputEMAIL').val();   else email =   objUsu.EMAIL ;
        if($('#inputTELEFON').val() != '') telefon = $('#inputTELEFON').val(); else telefon = objUsu.TELEFON ;

        objUsu = new usuari();
        objUsu.ID = 0;
        objUsu.NOM = nom;
        objUsu.COGNOM1 = cognom1;
        objUsu.COGNOM2 = cognom2;
        objUsu.DNI = dni;
        objUsu.EMAIL = email;
        objUsu.TELEFON = telefon;

        guardaObjetoLocal('CIUTADA' , objUsu);
    }
    catch (e)
    {
        mensaje(e.message , 'error');
    }
}

function datosObligatorios(sObs, sDir){
    if(sObs == null || sObs.trim() == '') return false;
    if(sDir == null || sDir.trim() == '') return false;
    return true;
}

function guardaIncidencia(sReferen){
    try
    {
        var nId = leeObjetoLocal('COMUNICATS_NEXTVAL' , -1) + 1;
        var fecha = FechaHoy() + ' ' + HoraAhora();
        var carrer = sDireccionAlta.split(",")[0];
        var num = sDireccionAlta.split(",")[1];

        // INSERT INTO COMUNICATS (ID, REFERENCIA, ESTAT, DATA, CARRER, NUM, COORD_X, COORD_Y, COMENTARI) VALUES (?,?,?,?,?,?,?,?,?);
        var fila = [nId, sReferen, 'PENDENT', fecha,carrer , num, sCoord_X, sCoord_Y, sComentario, null, null, null];
        var objComunicat = new comunicat();
        objComunicat.ID = nId;
        objComunicat.REFERENCIA = sReferen;
        objComunicat.ESTAT = 'PENDENT';
        objComunicat.DATA = fecha;
        objComunicat.CARRER = carrer;
        objComunicat.NUM = num;
        objComunicat.COORD_X = sCoord_X;
        objComunicat.COORD_Y = sCoord_Y;
        objComunicat.COMENTARI = sComentario;
        guardaObjetoLocal('COMUNICAT_' + nId.toString().trim() , objComunicat);

        guardaObjetoLocal('COMUNICATS_NEXTVAL', nId);
    }
    catch(e)
    {
        mensaje('ERROR (exception) en guardaIncidencia : \n' + e.code + '\n' + e.message);
    }
}