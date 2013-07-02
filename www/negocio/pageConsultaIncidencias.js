var mapConsulta = null;
var posConsulta = '';
var sDireccionConsulta = '';

function iniciaMapaConsulta() {
// Descapar para pruebas en PC :
//    var llamaWS = "http://213.27.242.251:8000/wsIncidentNotifier/wsIncidentNotifier.asmx/ConsultarIncidenciasZona";
//    var sParam  = "sLat=41.3965&sLon=2.1521";

    var mapOptions = {
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    mapConsulta = new google.maps.Map(document.getElementById('divMapaConsulta'), mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var paramPosInicial = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );

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

        } , function () { getCurrentPositionError(true); });
    }
    else
    {
        // Browser no soporta Geolocation
        getCurrentPositionError(false);
    }
    return true;
}

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
}