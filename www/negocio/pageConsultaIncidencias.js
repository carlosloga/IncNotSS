var mapConsulta = null;
var posConsulta = '';
var sDireccionConsulta = '';
var aMarcadoresSobrePlano = new Array();

function inicioPaginaConsultaIncidencias(){
    cargaListaComunicats(getComunicats());

    //Ocultar el plano
    $("#divMapaConsulta").hide();
    $("#divSobreMapaConsulta").hide();
    $("#buttonMostrarEnPlano").changeButtonText("mostrar plànol");
    $("#buttonMostrarEnPlano").button("refresh");
}

//aComs = array de objetos 'comunicat'
function cargaListaComunicats(aComs){
    $('#listviewLista').children().remove('li');

    if(aComs == null || aComs.length < 1) {
        $('#listviewLista').listview('refresh');
        return ;
    }

    var sFila = "";
    var sDatos = "";
    var separador = "#";

    for(var x=0; x<aComs.length; x++)
    {
        sDatos = getCadenaComunicat(aComs[x] , separador);

        //sFila = "<table style='width: 100%;'><tr><td style='text-align:left; font-size:x-small; width: 40%;'>" + aComs[x].REFERENCIA + "</td><td style='text-align:left; font-size:x-small; width: 40%;'>" + aComs[x].DATA + "</td><td style='text-align:left; font-size:x-small; width: 20%;'>" + aComs[x].ESTAT + "</td></tr></table>";
        sFila = "<table style='width: 100%;'><tr>";
        sFila += "<td style='text-align:left; font-size:x-small; width: 15%;'>" + aComs[x].ID + "</td>";
        sFila += "<td style='text-align:left; font-size:x-small; width: 55%;'>" + aComs[x].REFERENCIA + "</td>";
        sFila += "<td style='text-align:left; font-size:x-small; width: 30%;'>" + aComs[x].ESTAT + "</td>";
        sFila += "</tr></table>";
        $('#listviewLista').append($('<li/>', {
            'id': "fila_" + aComs[x].ID, 'data-icon': "arrow-r"
        }).append($('<a/>', {
                'href': '',
                'onclick': "verDatosComunicat('" + sDatos + "','" + separador + "')",
                'data-transition': 'slide',
                'html': sFila
        })));
    }
    $('#listviewLista').listview('refresh');

}

function verDatosComunicat(sDatos, separador){

    $('#labelCOMUNICAT_ID').text('');
    $('#labelCOMUNICAT_CARRER').text('');
    $('#labelCOMUNICAT_NUM').text('');
    $('#labelCOMUNICAT_COMENTARI').text('');
    $('#labelCOMUNICAT_REFERENCIA').text('');
    $('#labelCOMUNICAT_DATA').text('');
    $('#labelCOMUNICAT_ESTAT').text('');

    var aDatos = new Array();
    aDatos = sDatos.split(separador);

    try
    {
        $('#labelCOMUNICAT_ID').text(aDatos[0]);
        $('#labelCOMUNICAT_REFERENCIA').text(aDatos[1]);
        $('#labelCOMUNICAT_ESTAT').text(aDatos[2]);
        $('#labelCOMUNICAT_DATA').text(aDatos[3]);
        var sTipoVia = "";
        var sCalle = "";
        var calle = aDatos[4];
        try{
            if(calle.length > 3)
            {
                sTipoVia = calle.split("(")[1].substr(0, (calle.split("(")[1].length -1));
                sCalle = calle.split("(")[0];
            }
            $('#labelCOMUNICAT_CARRER').text(sTipoVia + ' ' + sCalle);
        }
        catch(e){
            $('#labelCOMUNICAT_CARRER').text(calle);
        }
        $('#labelCOMUNICAT_NUM').text(aDatos[5]);
        $('#labelCOMUNICAT_COMENTARI').text(aDatos[8]);
        $('#labelCOMUNICAT_COORDENADES').text(aDatos[6] + " , " + aDatos[7]);
    }
    catch(e) {
        mensaje('exception en verDatosComunicat : ' + e.message , 'error');
    }
    $("#panelDadesComunicat").panel("open");
    //abrirPagina('pageDatosComunicat');

}

function estadoDelPlano(){
    if($('#buttonMostrarEnPlano').text().trim().substr(0,7) == "ocultar")
    {
        $("#buttonMostrarEnPlano").changeButtonText("mostrar plànol");
        $("#divMapaConsulta").hide();
        $("#divSobreMapaConsulta").hide();
        $.mobile.silentScroll(0);
    }
    else
    {
        $("#divSobreMapaConsulta").show();
        $('#divMapaConsulta').show();
        $("#buttonMostrarEnPlano").changeButtonText("ocultar plànol");
        mostrarEnPlano();
        $.mobile.silentScroll(1000);
    }

    $("#buttonMostrarEnPlano").button("refresh");
}

function mostrarEnPlano() {
// Descapar para pruebas en PC :
//    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/ConsultarIncidenciasZona";
//    var sParam  = "sLat=41.3965&sLon=2.1521";
    var aComs = new Array();
    aComs = getComunicats();

    if(aComs == null || aComs.length < 1) {
        return false;
    }

    aMarcadoresSobrePlano = new Array();

    var mapOptions = {
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapConsulta = new google.maps.Map(document.getElementById('divMapaConsulta'), mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var paramPosInicial = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );

            //Prueba llamada al WS ...
            /*
                var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/ConsultarIncidenciasZona";
                var sParam  = "sLat=" + position.coords.latitude;
                sParam += "&sLon=" +  position.coords.longitude;

                try
                {
                                             //(sTipoLlamada,sUrl,   sParametros,sContentType,                       bCrossDom, sDataType, bProcData, bCache, nTimeOut, funcion,                          pasaParam,      asincro, bProcesar,tag)
                    var datos = LlamaWebService('GET',       llamaWS,sParam,     'application/x-www-form-urlencoded',true,      'xml',     false,     false,  10000,    resultadoConsultarIncidenciasZona,paramPosInicial,false,   true,     'pos');
                }
                catch (e)
                {
                    mensaje('ERROR (exception) en iniciaMapaConsulta : \n' + e.code + '\n' + e.message);
                }
            */

            var pos = null;
            var dir = '';
            var sTipoVia = '';
            var sCalle = '';
            for (var x = 0; x < aComs.length; x++) {
                pos = new google.maps.LatLng(aComs[x].COORD_X, aComs[x].COORD_Y);
                //dir = aComs[x].CARRER + ', ' + aComs[x].NUM ;
                sTipoVia = aComs[x].CARRER.split("(")[1].substr(0, (aComs[x].CARRER.split("(")[1].length -1));
                sCalle = aComs[x].CARRER.split("(")[0];
                dir = sTipoVia + ' ' + sCalle + ', ' + aComs[x].NUM;
                var sTxt = '<div><table><tr><td style="font-size:xx-small;"><b>comunicat </b>' + aComs[x].REFERENCIA + '</td></tr><tr><td style="font-size:xx-small;"><b>reportat el </b>' + aComs[x].DATA +'</td></tr><tr><td style="font-size:xx-small;"><b>en </b>' + dir + '</td></tr></table></div>';

                nuevoMarcadorSobrePlanoClickInfoWindow(mapConsulta, pos, sTxt, 300, false, false);
                aMarcadoresSobrePlano[x] = globalMarcadorMapa;
            }

            mapConsulta.setCenter(paramPosInicial);
            $('#divMapaConsulta').gmap('refresh');

        } , function () { getCurrentPositionError(true); });
    }
    else
    {
        // Browser no soporta Geolocation
        getCurrentPositionError(false);
    }
    return true;
}

function borrarHistoricoComunicados(){
    var nComunicats = leeObjetoLocal('COMUNICATS_NEXTVAL', -1);
    if(nComunicats != -1)
    {
        //Eliminar de la B.D.
        nComunicats += 1;
        var bBorrado = false;
        for(var x=0; x<nComunicats; x++)
        {
            bBorrado = borraObjetoLocal('COMUNICAT_' + x.toString().trim());
            if(!bBorrado) mensaje('El comunicat ' + x.toString().trim() + " no s'ha pogut esborrar","info");
        }
        //Actualizar la 'sequence'
        guardaObjetoLocal('COMUNICATS_NEXTVAL', -1);

        //limpiar el mapa :
        if(aMarcadoresSobrePlano.length > 0)
        {
            for (var x = 0; x < aMarcadoresSobrePlano.length; x++) {
                globalMarcadorMapa = aMarcadoresSobrePlano[x];
                eliminarMarcadorMapa();
            }
        }

        //limpiar la lista
        inicioPaginaConsultaIncidencias();
    }
}

//Prueba llamada al WS ...
/*
function resultadoConsultarIncidenciasZona(datos, param){
    if (global_AjaxERROR != '' || global_AjaxRESULTADO == null)
    {
        mensaje(global_AjaxERROR);
    }
    else
    {
        mapConsulta.setCenter(param);

        var sDatos = datos.toString();
        if (datos != null && datos.length > 0 && sDatos.substr(0, 5) != 'ERROR') {
            var aTabla = datos;

//mensaje('len tabla en resultadoConsultarIncidenciaZona : ' + aTabla.length.toString());
            var aRegistro = new Array();
            var sNomCampo = '';
            var sValCampo = '';
            for (var t = 0; t < aTabla.length; t++) {
                    aRegistro = new Array();
                    aRegistro = aTabla[t];
//mensaje('len aRegistro de tabla[' + t.toString() + '] = ' + aRegistro.length);
                    //Bucle por cada campo del registro actual
                    for (var r = 0; r < aRegistro.length; r++) {
                        sNomCampo = aRegistro[r].toString().split(',')[0];
                        sValCampo = aRegistro[r].toString().substr(sNomCampo.length + 1);

                        posConsulta = new google.maps.LatLng(sValCampo.split(",")[0], sValCampo.split(",")[1]);
                        sDireccionConsulta = cogerDireccion(posConsulta);
                        var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">incidencia reportada recientemente en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDireccionConsulta + '</td></tr></table></div>';
                        nuevaInfoWindowSobrePlano(mapConsulta, posConsulta, sTxt, 100);

                        nuevoMarcadorSobrePlano(mapConsulta , posConsulta, sDireccionConsulta);
                    }
            }
            //$('#divMapaConsulta').gmap('refresh');
        }
        else
        {
            mensaje('Error en WebService');
        }
    }
}*/
