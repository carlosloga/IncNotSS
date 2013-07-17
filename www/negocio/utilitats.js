var globalMarcadorMapa = null;

var lista_ERROR_SQL = new Array();
lista_ERROR_SQL[0] = 'ERROR desconegut';
lista_ERROR_SQL[1] = 'ERROR de base de dades';
lista_ERROR_SQL[2] = 'ERROR de versió';
lista_ERROR_SQL[3] = 'ERROR : massa llarg';
lista_ERROR_SQL[4] = 'ERROR : quota';
lista_ERROR_SQL[5] = 'ERROR de sintaxi';
lista_ERROR_SQL[6] = 'ERROR en constraint';
lista_ERROR_SQL[7] = 'ERROR timeout';

function localStorageRun() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function localStorageSupport() {
    if ("localStorage" in window && window["localStorage"] != null)
        return true;
    else
        return false;
}

function phoneGapRun() {
    return(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/));
}

function mensaje(msg,titulo) {
    if(phoneGapRun())
        navigator.notification.alert(msg, null, titulo);
    else
        alert(msg);

    //navigator.notification.alert('el mensaje',function() {},"el titulo" );
}

function abrirPopUp(pag){
    $.mobile.changePage("#" + pag, { transition: "pop", role: "dialog", reverse: true, changeHash: true });
    //$(".ui-dialog a[data-icon='delete']").remove();
}

function cerrarPopUp(pag){
    $("#" + pag).dialog("close");
}

function eliminarMarcadorMapa(){
    if(globalMarcadorMapa != null)
    {
        globalMarcadorMapa.setMap(null);
        globalMarcadorMapa = null;
    }
}

function nuevoMarcadorSobrePlanoClickInfoWindow(sMODO, mapa, pos,htmlText, nMaxAncho, bMostrarBocataDeInicio, bSoloUnMarcadorSobreMapa, labelMostrarDir){
    if(bSoloUnMarcadorSobreMapa) {
        eliminarMarcadorMapa();
    }

    if(sMODO == 'ALTA')
        posAlta = pos; //por si es una alta, que envie al WS las coordenadas correctas

    var marcador = new google.maps.Marker({
        position: pos,
        map: mapa
    });
    globalMarcadorMapa = marcador;

    if(indefinidoOnullToVacio(htmlText) != '' && indefinidoOnullToVacio(nMaxAncho) != '')
    {
        var bocata = new google.maps.InfoWindow({ content: htmlText, maxWidth: nMaxAncho});
        google.maps.event.addListener(marcador, 'click', function() {
            bocata.open(mapa,marcador);
        });
        if(bMostrarBocataDeInicio)bocata.open(mapa,marcador);
    }

    if(sMODO == 'ALTA')
    {
        if(indefinidoOnullToVacio(labelMostrarDir) != '') $('#' + labelMostrarDir).text(sDireccionAlta);

        mapa.setCenter(posAlta);
    }
}

function crearMarcadorEventoClick(sMODO, map, bSoloUnMarcadorSobreMapa , labelMostrarDir, bActualizarControlesManualesCalleNum){
    google.maps.event.addListener(map, 'click', function(event) {

        var bDirEsLatLon = false;

        if(bSoloUnMarcadorSobreMapa) {
            eliminarMarcadorMapa();
        }

        if(sMODO == 'ALTA')
            posAlta = event.latLng; //por si es una alta, que envie al WS las coordenadas correctas

        var sDir = cogerDireccion(event.latLng, true);   //true ==> solo calle y num
        if(sDir == '')
        {
            sDir  = event.latLng.lat() + " , " + event.latLng.lng();
            bDirEsLatLon = true;
        }
        else
        {
            bDirEsLatLon = false;
        }

/*        if(sMODO == 'ALTA' && indefinidoOnullToVacio(labelMostrarDir) != '')
            $('#' + labelMostrarDir).text(sDir);*/

        if(sMODO == 'ALTA')
            sDireccionAlta = sDir;

        var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">comuinicat en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDir + '</td></tr></table></div>';
        nuevoMarcadorSobrePlanoClickInfoWindow(sMODO, map, event.latLng, sTxt, 300, true, true, labelMostrarDir);

        if(sMODO == 'ALTA')
            if(indefinidoOnullToVacio(bActualizarControlesManualesCalleNum) != '' && !bDirEsLatLon)
                if(bActualizarControlesManualesCalleNum) autoRellenoCalleNum();

    });
}

function crearMarcadorDesdeCalleNum(){
    if($('#selectCARRER').find(":selected").text().trim() == '' || $('#inputNUM').val().trim() == '' ) return;

    var calle = $('#selectCARRER').find(":selected").text().trim();
    var sTipoVia = calle.split("(")[1].substr(0, (calle.split("(")[1].length -1)).trim();
    var sCalle = calle.split("(")[0].trim();
    var num = $('#inputNUM').val().trim();
    var ciudad = "Barcelona";
    var region = "Catalunya";
    var pais = "Spain";

    showAddress('ALTA',mapAlta, sTipoVia,sCalle, num , ciudad ,region ,pais);
}

function showAddress(sMODO,map, sTipoVia,sCalle,num,ciudad,region,pais) {
    sDireccionAlta = sTipoVia + " " + sCalle + ", " + num;
    var direccion = sDireccionAlta + ", " + ciudad + ", " + region + ", " + pais;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': direccion}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            var sTxt = '<div><table><tr><td style="font-size:x-small; font-weight:bold;">comunicat en </td></tr><tr><td style="font-size:x-small; font-weight:normal;">' + sDireccionAlta + '</td></tr></table></div>';
            nuevoMarcadorSobrePlanoClickInfoWindow(sMODO,map, results[0].geometry.location , sTxt , 300 , true, true, 'labelDireccion');
        } else {
            alert('La localització sobre plànol no ha estat posible per : ' + status);
        }
    });
}

function getCurrentPositionError(errorFlag) {
    var content = '';
    if (errorFlag) {
        content = 'Error en el servei de geolocalització.';
    } else {
        content = 'Error: el seu navegador no soporta geolocalització';
    }
    mensaje(content);
}

function cogerDireccion(pos , bSoloCalleYnum){
    var llamaWS = "http://maps.googleapis.com/maps/api/geocode/xml";
    var sParam =  "latlng=" + pos.toString().replace(" ", "").replace("(","").replace(")","") + "&sensor=true";
    var sDireccion = '';
    //alert(sParam);
    try
    {
        //function LlamaWebService (sTipoLlamada,sUrl,   sParametros,sContentType,                        bCrossDom, sDataType, bProcData, bCache, nTimeOut, funcion, pasaParam, asincro, bProcesar, tag)
        var datos = LlamaWebService('GET',      llamaWS,sParam,     'application/x-www-form-urlencoded', true,      'xml',     false,     false,  10000,    null,    null,      false,   false,     null);
        if (global_AjaxERROR != '')
            mensaje(global_AjaxERROR);
        else
        {
            sDireccion = $(datos).find('formatted_address').text();
            var n = 0;
            $(datos).find('formatted_address').each(function () {
                if (n == 0) sDireccion = $(this).text();
                n++;
            });
        }

        if(indefinidoOnullToVacio(bSoloCalleYnum) != '')
            if(bSoloCalleYnum) sDireccion = cogerCalleNumDeDireccion(sDireccion);
    }
    catch (e)
    {
        mensaje('ERROR (exception) en cogerDireccion : \n' + e.code + '\n' + e.message);
    }
    return sDireccion;
}

function cogerCalleNumDeDireccion(sDireccion){
    var sDev = '';
    try
    {
        if(indefinidoOnullToVacio(sDireccion) != '')
                sDev = sDireccion.split(",")[0] + ", " + sDireccion.split(",")[1];
    }
    catch(e) {}
    return sDev;
}

function FechaHoy() {
    var d = new Date();
    return (parseInt(d.getDate()) < 10 ? '0' : '') + d.getDate().toString() + '/' + (parseInt(d.getMonth() + 1) < 10 ? '0' : '') + (parseInt(d.getMonth()) + 1).toString() + '/' + d.getFullYear().toString();
}

function HoraAhora() {
    var d = new Date();
    return (parseInt(d.getHours()) < 10 ? '0' : '') + d.getHours().toString() + ':' + (parseInt(d.getMinutes()) < 10 ? '0' : '') + d.getMinutes().toString() + ":00" ;
}

function ReplicateString(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 0) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result;
}

function estadoControl(control, bHabilitar){
    if(bHabilitar)
    {
        try{ $('#' + control).removeAttr("disabled", "disabled"); } catch(e) {}
        try{ $('#' + control).removeClass('ui-disabled'); } catch(e) {}
        try{ $('#' + control).attr("enabled", "enabled"); } catch(e) {}
        try{ $('#' + control).addClass('ui-enabled'); } catch(e) {}
    }
    else
    {
        try{ $('#' + control).removeAttr("enabled", "enabled"); } catch(e) {}
        try{ $('#' + control).removeClass('ui-enabled'); } catch(e) {}
        try{ $('#' + control).attr("disabled", "disabled"); } catch(e) {}
        try{ $('#' + control).addClass('ui-disabled'); } catch(e) {}
    }
}

function estadoBoton(boton, bHabilitar){
    if(bHabilitar)
    {
        try{ $('#' + boton).button('enable'); } catch(e) { }
        try{ $('#' + boton).attr("enabled", "enabled"); } catch(e) {}
        try{ $('#' + boton).removeClass('ui-disabled'); } catch(e) {}
    }
    else
    {
        try{ $('#' + boton).button('disable'); } catch(e) { }
        try{ $('#' + boton).addClass('ui-disabled'); } catch(e) { }
        try{ $('#' + boton).attr("disabled", "disabled"); } catch(e) { }
    }

    try{ $('#' + boton).attr("onclick", ""); } catch(e) { }
    try{ $('#' + boton).attr('href', '');  } catch(e) { }
    try{ $('#' + boton).button('refresh');  } catch(e) { }
}

//cambiar el texto de un boton
(function($) {
    /*
     * Changes the displayed text for a jquery mobile button.
     * Encapsulates the idiosyncracies of how jquery re-arranges the DOM
     * to display a button for either an <a> link or <input type="button">
     */
    $.fn.changeButtonText = function(newText) {
        return this.each(function() {
            $this = $(this);
            if( $this.is('a') ) {
                $('span.ui-btn-text',$this).text(newText);
                return;
            }
            if( $this.is('input') ) {
                $this.val(newText);
                // go up the tree
                var ctx = $this.closest('.ui-btn');
                $('span.ui-btn-text',ctx).text(newText);
                return;
            }
        });
    };
})(jQuery);

function indefinidoOnullToVacio(algo){
    if (undefined === algo) return '';
    if (void 0 === algo) return '';
    if(algo == null) return '';
    return algo;
}