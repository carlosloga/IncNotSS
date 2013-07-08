
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
        //function LlamaWebService (sTipoLlamada,sUrl,   sParametros,sContentType,                        bCrossDom, sDataType, bProcData, bCache, nTimeOut, funcion, pasaParam, asincro, bProcesar, tag)
        var datos = LlamaWebService('POST',      llamaWS,sParam,     'application/x-www-form-urlencoded', true,      'xml',     false,     false,  10000,    null,    null,      false,   false,     null);
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