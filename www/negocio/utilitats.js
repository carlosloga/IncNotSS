
function phoneGapRun() {
    return(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/));
}

function mensaje(msg) {
    if(phoneGapRun())
        navigator.notification.alert(msg, null, 'Atenció');
    else
        alert(msg);
}

function abrirPopUp(pag){
    $.mobile.changePage("#" + pag, { transition: "pop", role: "dialog", reverse: true, changeHash: true });
}

function nuevaInfoWindowSobrePlano(mapa, pos,htmlText, nMaxAncho ){
    var infowindow = new google.maps.InfoWindow({
        map: mapa,
        position: pos,
        content: htmlText,
        maxWidth: nMaxAncho
    });
}

function nuevoMarcadorSobrePlano(mapa, pos, texto){
    var marker = new google.maps.Marker({
        position: pos,
        map: mapa,
        title: texto
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

function cogerDireccion(pos){
    var llamaWS = "http://maps.googleapis.com/maps/api/geocode/xml";
    var sParam =  "latlng=" + pos.toString().replace(" ", "").replace("(","").replace(")","") + "&sensor=true";
    var sDireccion = '';
    //alert(sParam);
    try
    {
        var datos = LlamaWebService('GET',llamaWS,sParam,'application/x-www-form-urlencoded', true, 'xml', false, false, 10000, null, null, false, false,null);
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
    }
    catch (e)
    {
        mensaje('ERROR (exception) en cogerDireccion : \n' + e.code + '\n' + e.message);
    }
    return sDireccion;
}