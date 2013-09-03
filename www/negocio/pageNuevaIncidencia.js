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

    //Por si se había quedado expandido el desplegable de los datos del ciudadano
    $('#collapsibleQuiSoc').trigger('collapse');

    //iniciar el plano
    iniciaMapaAlta(true);
    $.doTimeout(500, function() {
            cierraMapaAbreComentario();
    });
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
        var sIdCarrer = '';

        for(var x=0 ; x<aGlobalCarrers.length; x++)
        {
            if(aGlobalCarrers[x].CARRER.trim().toUpperCase() == sCarrerDetectat.trim().toUpperCase())
            {
                if(aGlobalCarrers[x].TIPUS.trim().toUpperCase() == sTipusDetectat.trim().toUpperCase())
                {
                    sIdCarrer = aGlobalCarrers[x].ID;
                    break;
                }
            }
        }

        if(sIdCarrer != '') {
            $('#inputNUM').val(sDireccionAlta.split(",")[1].trim());
            $('#selectCARRER').val(sIdCarrer);
            $('#selectCARRER').selectmenu('refresh');
        }
    }
    catch(e){}
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
    abrirPagina('pageZoomFoto', true);
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
            crearMarcadorEventoClick('ALTA', mapAlta, true,'labelDireccion', true);

            posAlta = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            sDireccionAlta = cogerDireccion(posAlta, true);

/*            var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">comunicat en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDireccionAlta + '</td></tr></table></div>';
            nuevoMarcadorSobrePlanoClickInfoWindow('ALTA', mapAlta, posAlta,sTxt,null,300,true,true);
            $('#labelDireccion').text(sDireccionAlta);
            $('#divMapaAlta').gmap('refresh');*/

        }, function () { getCurrentPositionError(true); });
    } else {
        // Browser no soporta Geolocation
        getCurrentPositionError(false);
    }
}

function cogerDireccion(pos , bSoloCalleYnum){
    var llamaWS = "http://maps.googleapis.com/maps/api/geocode/xml";
    var sParam =  "latlng=" + pos.toString().replace(" ", "").replace("(","").replace(")","") + "&sensor=true";
    var sDireccion = '';
    //alert(sParam);
    try
    {
        //function LlamaWebService (sTipoLlamada,sUrl,   sParametros,sContentType,                        bCrossDom, sDataType, bProcData, bCache, nTimeOut, funcion,           pasaParam,      asincro, bProcesar, tag)
        var datos = LlamaWebService('GET',      llamaWS,sParam,     'application/x-www-form-urlencoded', true,      'xml',     false,     false,  10000,     direccionObtenida, bSoloCalleYnum, true,    false,     null);
    }
    catch (e)
    {
        mensaje('ERROR (exception) en cogerDireccion : \n' + e.code + '\n' + e.message);
    }
    //return sDireccion;
}
function direccionObtenida(datos, param){
    if(datos == null ) return;
    var sDireccion = $(datos).find('formatted_address').text();

    var n = 0;
    $(datos).find('formatted_address').each(function () {
        if (n == 0) sDireccion = $(this).text();
        n++;
    });

    if(indefinidoOnullToVacio(param) != '')
        if(param)
            sDireccion = cogerCalleNumDeDireccion(sDireccion);

    sDireccionAlta = sDireccion;

    var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">comunicat en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDireccionAlta + '</td></tr></table></div>';
    nuevoMarcadorSobrePlanoClickInfoWindow('ALTA', mapAlta, posAlta,sTxt,null,300,true,true);
    $('#labelDireccion').text(sDireccionAlta);
    $('#divMapaAlta').gmap('refresh');

}

// -------- NETEJAR CIUTADA -------------------------------------------------------------------
function netejarDades(){
    $('#inputNOM').val('');
    $('#inputCOGNOM1').val('');
    $('#inputCOGNOM2').val('');
    $('#inputDNI').val('');
    $('#inputEMAIL').val('');
    $('#inputTELEFON').val('');

    $('#labelQUISOC').text(' ');
    <!-- $('#collapsibleQuiSoc').trigger('collapse'); -->
}

// -------- ENVIAR INCIDENCIA -----------------------------------------------------------------
function fail(error) {
    alert(error);
}
function enviarIncidencia() {
    guardaDatosCiudadano();

    var sCoord = posAlta.toString().replace(" ", "").replace("(","").replace(")","");
    sComentario = $('#textareaComentari').val();

    if(sCoord != null && sCoord.trim() != '')
    {
        sCoord_X = sCoord.split(",")[0];
        sCoord_Y = sCoord.split(",")[1];
    }

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

/*  var sParams = "";
    sParams += "sNom=" + $('#inputNOM').val() + '';
    sParams += "&sCognom1=" + $('#inputCOGNOM1').val() + '';
    sParams += "&sCognom2=" + $('#inputCOGNOM2').val() + '';
    sParams += "&sDni=" + $('#inputDNI').val() + '';
    sParams += "&sEmail=" + $('#inputEMAIL').val() + '';
    sParams += "&sTelefon=" + $('#inputTELEFON').val() + '';
    sParams += "&sObs=" + sComentario + '';
    sParams += "&sCoord=" + sCoord + '';
    sParams += "&sDir=" + sDireccionAlta + '';
    sParams += "&sFoto=" + sFoto;  //encodeURIComponent(imagenDePrueba()) + '';
*/

    var sParams = {sNom:$('#inputNOM').val() + '', sCognom1:$('#inputCOGNOM1').val() + '', sCognom2:$('#inputCOGNOM2').val() + '', sDni:$('#inputDNI').val() + '', sEmail:$('#inputEMAIL').val() + '', sTelefon:$('#inputTELEFON').val() + '', sObs:sComentario + '', sCoord:sCoord + '', sDir:sDireccionAlta + '', sFoto: sFoto};

    var ref = enviarComunicat_WS(sParams , true);
}

function enviarComunicat_WS(sParams , bNuevoComunicat){
    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidencia";
  //var llamaWS = "http://172.26.0.2:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidencia";
    try
    {
        var bEnvioCorrecto = true;
        var sEstado = "";
        var sMensaje = "";
        var sTitulo = "";
        var sReferen = "";
        global_AjaxERROR = '';
        //var datos = LlamaWebService('GET',llamaWS,sParams,'application/x-www-form-urlencoded',true,'xml',false,false,10000,null, null,false,false,null);
        envioWSpost(llamaWS,sParams);
        $.doTimeout(500, function() {
            try
            {
                var datos = global_AjaxRESULTADO;
                if(datos == null)  //==> ha habido error
                {
                    if (global_AjaxERROR != '' || global_AjaxRESULTADO == null) {
                        mensaje(global_AjaxERROR, 'error');
                        sReferen = "------------";
                        sMensaje = "Comunicació guardada en el dispositiu";
                        sTitulo = "no hi ha conexió";
                        bEnvioCorrecto = false;
                    }
                    else
                    {
                        mensaje("No s'ha pogut rebre confirmació de l'enviament de la comunicació " ,'error');
                        sReferen = "------------";
                        sMensaje = "Comunicació guardada en el dispositiu";
                        sTitulo = "error enviant";
                        bEnvioCorrecto = false;
                    }
                }
                else               //==> ha ido bien
                {
                    sReferen = $(datos).find('resultado').text();
                    sMensaje = 'Comunicació notificada\n' + 'Gràcies per la seva col·laboració';
                    sTitulo = "info"
                }

                if(bNuevoComunicat){
                    if(!bEnvioCorrecto)
                        sEstado = "PENDENT_ENVIAMENT";
                    else
                        sEstado = "NOTIFICAT";

                    var nIdCom = guardaIncidencia(sReferen, sEstado);

                    if(!bEnvioCorrecto)
                    {
                        guardaFotoEnLocal(nIdCom, sFoto);
                    }
                    eliminarFoto();
                    limpiaVariables('pageNuevaIncidencia');
                    mensaje(sMensaje, sTitulo);
                    abrirPagina('pageIndex', false);
                }

                if(bEnvioCorrecto)
                    return sReferen;
                else
                    return null;

            }
            catch(ex){
                mensaje('ERROR (exception) en resultadoEnvio : \n' + ex.code + '\n' + ex.message , 'error');
                return null;
            }
        });
    }
    catch(e)
    {
        mensaje('ERROR (exception) en enviarIncidencia : \n' + e.code + '\n' + e.message);
        return null;
    }
}

/*function resultadoEnvio(resultado, param){
    try{
        var sMensaje = "";
        var sTitulo = "";
        var sReferen = "";

        //Si el envio al WS ha dado ERROR  :
        if (global_AjaxERROR != '' || global_AjaxRESULTADO == null) {
            mensaje(global_AjaxERROR);
            sReferen = "PENDENT_ENVIAMENT";
            sMensaje = "Comunicació guardada en el dispositiu";
            sTitulo = "no hi ha conexió";
        }
        else //Si el envio al WS ha ido bien (me ha devuelto la Referencia EUDLC :
        {
            //ATENCIÓN !!!!!!!!!!!!!!!! hay que recoger bien este valor devuelto por el WS  !!!!!!!!!!!!!!!!!!!!!!
            //sReferen = global_AjaxRESULTADO[0];

            //para pruebas :
            sReferen = "EUDLC000000000000";

            sMensaje = 'Comunicació notificada\n' + 'Gràcies per la seva col·laboració';
            sTitulo = "info";
        }
        guardaIncidencia(sReferen);
        eliminarFoto();
        limpiaVariables('pageNuevaIncidencia');
        mensaje(sMensaje, sTitulo);
        abrirPagina('pageIndex', false);
    }
    catch(e)
    {
        mensaje('ERROR (exception) en resultadoEnvio : \n' + e.code + '\n' + e.message , 'error');
    }
}*/

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

function guardaIncidencia(sReferen, sEstado){
    try
    {
        var nId = leeObjetoLocal('COMUNICATS_NEXTVAL' , -1) + 1;
        var fecha = FechaHoy() + ' ' + HoraAhora();
        var carrer = sDireccionAlta.split(",")[0];
        var num = sDireccionAlta.split(",")[1];

        //INSERT INTO COMUNICATS (ID, REFERENCIA, ESTAT, DATA, CARRER, NUM, COORD_X, COORD_Y, COMENTARI) VALUES (?,?,?,?,?,?,?,?,?);
        //var fila = [nId, sReferen, 'PENDENT', fecha,carrer , num, sCoord_X, sCoord_Y, sComentario, null, null, null];

        var objComunicat = new comunicat();
        objComunicat.ID = nId;
        objComunicat.REFERENCIA = sReferen;
        objComunicat.ESTAT = sEstado;
        objComunicat.DATA = fecha;
        objComunicat.CARRER = carrer;
        objComunicat.NUM = num;
        objComunicat.COORD_X = sCoord_X;
        objComunicat.COORD_Y = sCoord_Y;
        objComunicat.COMENTARI = sComentario;
        guardaObjetoLocal('COMUNICAT_' + nId.toString().trim() , objComunicat);

        guardaObjetoLocal('COMUNICATS_NEXTVAL', nId);

        return nId;
    }
    catch(e)
    {
        mensaje('ERROR (exception) en guardaIncidencia : \n' + e.code + '\n' + e.message);
        return -1;
    }
}

function guardaFotoEnLocal(nId,sFoto){
      guardaObjetoLocal('FOTO_' + nId.toString().trim() , sFoto);
}