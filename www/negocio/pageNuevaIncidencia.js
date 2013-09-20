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
    var ciu = cargaDatosCiudadano();
    //Si los datos del ciudadano están guardados, se arranca la página como comunicació NO anónima y el acordeón 'qui soc' cerrado
    //y si no existen datos del ciudadano, se arranca la página como comunicació anónima y el acordeón 'qui soc' abierto
    if(ciu=='')
    {
        $('#collapsibleQuiSoc').trigger('expand');
        $('#check_ComAnonima').attr("checked",true).checkboxradio("refresh");
        $('#labelQUISOC').text("[ANÒNIM]");
    }
    else
    {
        $('#check_ComAnonima').attr("checked",false).checkboxradio("refresh");
        $('#collapsibleQuiSoc').trigger('collapse');
    }

    var nLetra = 65;
    var combo = $('#selectLletraIniCARRER');
    cargaLetrasAbcdario(combo, 'lletra inicial' , nLetra );

    //iniciar el plano
    iniciaMapaAlta(true);
    $.doTimeout(800, function() {
//        preseleccionar la inicial, cargar CARRERS de esa inicial en el combo de iniciales y preseleccionar la calle
//        var sC = cogerCalleNumDeDireccion(sDireccionAlta);
//        nLetra = sC.substr(0,1).toUpperCase().charCodeAt(0);
//        !!!!!!!!!!!!!! no consigo obtener el nombre de la calle desde google maps, ya que devuelve 'carrer de tal ... '

        var combo = $('#selectLletraIniCARRER');
        cargaLetrasAbcdario(combo, 'lletra inicial' , nLetra );
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
        if((objUsu.NOM + ' ' + objUsu.COGNOM1 + ' ' + objUsu.COGNOM2).trim() == '')
            return '';
        else
            return (objUsu.NOM + ' ' + objUsu.COGNOM1 + ' ' + objUsu.COGNOM2).trim();
    }
    else
        return '';
}
function cargaCalles(){
    if(aCarrers == null)
        mensaje("No s'han trobat carrers","informació");
    else
    {
        $('#selectCARRER').children().remove('li');
        $('#selectCARRER').empty();
        $('#selectCARRER').children().remove();

        var calles = [];
        calles.push("<option value='-1' data-placeholder='true'>Seleccioni el carrer</option>");
        for (var x = 0; x < aCarrers.length; x++)
        {
            calles.push("<option value='" + aCarrers[x][0][1] + "'>" + aCarrers[x][2][1] + " (" +  aCarrers[x][1][1] + ")</option>"); // [" + aCarrers[x][3][1] + "]</option>");
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
//abre la cámara para hacer foto o la voge de la galeria
function hacerFoto(origen) {
    try {
        if(origen=='CAMARA')
        {
            iniciaMapaAlta(false);
            navigator.camera.getPicture(hacerfotoOK, hacerFotoERROR, { quality: 20, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.CAMERA, encodingType: Camera.EncodingType.JPEG, saveToPhotoAlbum: false });
        }
        else  // coger de GALERIA
        {
            navigator.camera.getPicture(hacerfotoOK, hacerFotoERROR, { quality: 20, destinationType: Camera.DestinationType.DATA_URL, sourceType: Camera.PictureSourceType.PHOTOLIBRARY, encodingType: Camera.EncodingType.JPEG, saveToPhotoAlbum: false });
        }
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
        mensaje('Cap foto caprturada : ' + errorOcancel.code);
    }
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
    try{
        var mapOptions = {
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapAlta = new google.maps.Map(document.getElementById('divMapaAlta'), mapOptions);
        $('#divMensajeMapa').hide();
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

            }, function () {
                $('#divContieneMapa').hide();
                $('#divMensajeMapa').show();
                //$('#divMapaAlta').hide();
                cierraMapaAbreComentario();
                getCurrentPositionError(true);
            });
        } else {  alert('error mapa');
            // Browser no soporta Geolocation
            $('#divContieneMapa').hide();
            $('#divMensajeMapa').show();
            //$('#divMapaAlta').hide();
            cierraMapaAbreComentario();
            getCurrentPositionError(false);
        }
    }
    catch(e)
    {
        $('#divContieneMapa').hide();
        $('#divMensajeMapa').show();
        //$('#divMapaAlta').hide();
        cierraMapaAbreComentario();
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
        var datos = LlamaWebService('GET',llamaWS,sParam, 'application/x-www-form-urlencoded', true,      'xml',     false,     false,  10000, direccionObtenida, bSoloCalleYnum, true,    false,     null);
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
    nuevoMarcadorSobrePlanoClickInfoWindow('ALTA', mapAlta, posAlta,sTxt,null,300,true,true,'labelDireccion');
    $('#labelDireccion').text(sDireccionAlta);
    $('#divMapaAlta').gmap('refresh');

}

// -------- ENVIAR/GUARDAR COMUNICAT -----------------------------------------------------------
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
    var sMsg =  datosObligatorios(sComentario, sDireccionAlta, $('#inputDNI').val(), $('#inputEMAIL').val() ,$('#inputTELEFON').val() );
    if(sMsg != ""){
        mensaje(sMsg,'Atenció');
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

    //var sParams = {sNom:$('#inputNOM').val() + '', sCognom1:$('#inputCOGNOM1').val() + '', sCognom2:$('#inputCOGNOM2').val() + '', sDni:$('#inputDNI').val() + '', sEmail:$('#inputEMAIL').val() + '', sTelefon:$('#inputTELEFON').val() + '', sObs:sComentario + '', sCoord:sCoord + '', sDir:sDireccionAlta + '', sFoto: sFoto};
    var sParams = {sNom:$('#inputNOM').val() + '', sCognom1:$('#inputCOGNOM1').val() + '', sCognom2:$('#inputCOGNOM2').val() + '', sDni:$('#inputDNI').val() + '', sEmail:$('#inputEMAIL').val() + '', sTelefon:$('#inputTELEFON').val() + '', sObs:sComentario + '', sCoord:sCoord + '', sCodCarrer:$('#selectCARRER').val() + '', sCarrer:$('#selectCARRER').find(":selected").text() + '', sNumPortal:$('#inputNUM').val() + '', sFoto: sFoto};

    var ref = enviarComunicat_WS(sParams , true);
}
function enviarComunicatPendiente_WS(sParams, bNuevoComunicat ){
    var sDev = '';
    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidenciaBD";
    var sMensaje = "";
    var sTitulo = "";

    $.ajax({
        type: 'POST',
        url: llamaWS,
        data: sParams,
        success: function(datos) {
            var sReferen = $(datos).find('resultado').text().trim();
            if(sReferen.indexOf('|') > 0)
            {
                sMensaje = 'La seva comunicació ha estat rebuda però amb problemes : \n ' + sReferen.substr(sReferen.indexOf('|') + 1);
                sTitulo = "atenció";
                sReferen = sReferen.substr(0,sReferen.indexOf('|'));
                sDev = "ERROR";
            }
            else
            {
                if(sReferen.indexOf('|') == 0)
                {
                    sMensaje = "La seva comunicació no s'ha processat correctament. [" + sReferen.substr(1) + "]\n";
                    sTitulo = "error";
                    sReferen = "ERROR";
                    sDev = "ERROR";
                }
                else
                {
                    sMensaje = 'Comunicació notificada [' + sReferen + ']\n' + 'Gràcies per la seva col·laboració';
                    sTitulo = "info";
                    sDev = sReferen;
                }
            }
            mensaje(sMensaje, sTitulo);
        },
        error: function(error) { sDev = "ERROR"; } ,
        async:false
    });
    return sDev;
}
function enviarComunicat_WS(sParams , bNuevoComunicat){
    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/NuevaIncidenciaBD";
    try
    {
        var bEnvioCorrecto = true;
        var sEstado = "";
        var sMensaje = "";
        var sTitulo = "";
        var sReferen = "";

        $.post(llamaWS, sParams).done(function(datos) {
            try
            {
                if(datos == null)  //==> ha habido error
                {
                    mensaje("No s'ha rebut confirmació de l'enviament de la comunicació " ,'error');
                    sReferen = "-";
                    sMensaje = "Comunicació guardada en el dispositiu";
                    sTitulo = "error enviant";
                    bEnvioCorrecto = false;
                }
                else  //==> el WS ha devuelto algo
                {
                    sReferen = $(datos).find('resultado').text().trim();
                    if(sReferen.indexOf('|') > 0)
                    {
                        sMensaje = 'La seva comunicació ha estat rebuda però amb problemes : \n ' + sReferen.substr(sReferen.indexOf('|') + 1);
                        sTitulo = "atenció";
                        sReferen = sReferen.substr(0,sReferen.indexOf('|'));
                    }
                    else
                    {
                        if(sReferen.indexOf('|') == 0)
                        {
                            sMensaje = "La seva comunicació no s'ha processat correctament. [" + sReferen.substr(1) + "]\n";
                            sTitulo = "error";
                            sReferen = "ERROR";
                            bEnvioCorrecto = false;
                        }
                        else
                        {
                            sMensaje = 'Comunicació notificada [' + sReferen + ']\n' + 'Gràcies per la seva col·laboració';
                            sTitulo = "info";
                        }
                    }
                }

                if(bNuevoComunicat){
                    if(bEnvioCorrecto)
                        sEstado = "NOTIFICAT";
                    else
                        sEstado = "PENDENT_ENVIAMENT";

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
                else
                {
                    if(!bEnvioCorrecto)
                        mensaje(sMensaje, sTitulo);
                }
            }
            catch(ex){
                mensaje('ERROR (exception) en resultadoEnvio : \n' + ex.code + '\n' + ex.message , 'error');
                return null;
            }
        }).fail(function() {
                if( bNuevoComunicat){
                    var nIdCom = guardaIncidencia("-","PENDENT_ENVIAMENT");
                    guardaFotoEnLocal(nIdCom, sFoto);
                    limpiaVariables('pageNuevaIncidencia');
                }
                sMensaje = "La seva comunicació no s'ha pogut enviar \n ";
                if(sReferen.trim().length > 0 ) sMensaje += sReferen.substr(1) + '\n';
                sMensaje += "Quan tingui connexió pot enviar-la des de 'Els meus comunicats'" ;
                sTitulo = "atenció";
                sReferen = "ERROR";
                mensaje(sMensaje, sTitulo);

                abrirPagina('pageIndex', false);
        });
    }
    catch(e)
    {
        mensaje('ERROR (exception) en enviarComunicat_WS : \n' + e.code + '\n' + e.message);
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
function datosObligatorios(sObs, sDir, sDni , sEmail, sTelefon){
    if(sObs == null || sObs.trim() == '') return "Les dades marcades amb (*) són obligatòries\nFalta 'què està passant'" ;
    if(sDir == null || sDir.trim() == '') return "Les dades marcades amb (*) són obligatòries\nFalta 'on està passant'";

    if($(check_ComAnonima).is(':checked')){
        return "";
    }
    else
    {
        var sPosibleFalloMail = "";
        var sPosibleFalloTelefono = "";
        if(sDni == null || sDni.trim() == '')
        {
            return "Si la comunicació no és anònima, és obligatori el DNI/NIF i també el telèfon o l'adreça electrònica";
        }
        else
        {
            if(!esDni(sDni)) return "El DNI/NIF no és vàlid";
            if( (sEmail == null || sEmail.trim() == '') && (sTelefon == null || sTelefon.trim() == '') )
            {
                return "Si la comunicació no és anònima, és obligatori : el DNI/NIF  i també el telèfon o l'adreça electrònica";
            }
            else
            {
                if(sEmail != null && sEmail.trim() != '') if(!esEmail(sEmail)) sPosibleFalloMail = "L'adreça electrònica introduida no és correcta";
                if(sTelefon != null && sTelefon.trim() != '') if(!esTelefono(sTelefon)) sPosibleFalloTelefono = "El telèfon introduit no és correcte";

                if( (sEmail == null || sEmail.trim() == '' || sPosibleFalloTelefono != "") && sPosibleFalloTelefono != "" ) return sPosibleFalloTelefono;
                if( (sTelefon == null || sTelefon.trim() == '' || sPosibleFalloMail != "") && sPosibleFalloMail != "" ) return sPosibleFalloMail;
            }
        }
    }
    return "";
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
        objComunicat.REFERENCIA = sReferen.trim();
        objComunicat.ESTAT = sEstado;
        objComunicat.DATA = fecha;
        objComunicat.CARRER = carrer;
        objComunicat.NUM = num;
        objComunicat.COORD_X = sCoord_X + '';
        objComunicat.COORD_Y = sCoord_Y + '';
        objComunicat.COMENTARI = sComentario;
        objComunicat.ID_MSG_MOV = sReferen.trim();
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

// -------- NETEJAR CIUTADA -------------------------------------------------------------------
function netejarDades(){
    $('#inputNOM').val('');
    $('#inputCOGNOM1').val('');
    $('#inputCOGNOM2').val('');
    $('#inputDNI').val('');
    $('#inputEMAIL').val('');
    $('#inputTELEFON').val('');
}