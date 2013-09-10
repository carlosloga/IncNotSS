// funciones COMUNES -----------------------------------------------------------------------
var pictureSource;
var destinationType;
var sCambioPagina = '';
var aGlobalCarrers = null;

var global_RETORNO = '';

// -------- Al INICIAR -----------------------------------------------------------------------
window.addEventListener('load', function () {
    if (phoneGapRun()) {
        document.addEventListener("deviceReady", deviceReady, false);
    } else {
        deviceReady();
    }
}, false);

function deviceReady() {
    if (phoneGapRun()) {
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
    }
    else
    {
        $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : Phonegap no soportat');
    }

    //Hay localstorage ?
    if( ! $.jStorage.storageAvailable() )
    {
        estadoBoton('buttonALTA', false);
        estadoBoton('buttonCONSULTA', false);
        $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : localStorage no soportat');
        return;
    }
    else
    {
        try{
                var aCarrers = cargaCarrers();
                if(aCarrers != null )
                {
                    for(x=0; x<aCarrers.length; x++)
                    {
                        mensaje(aCarrers[x][0] + ' / ' + aCarrers[x][1] + ' / ' + aCarrers[x][2] + ' / ' + aCarrers[x][3] , 'un carrer');
                    }
                }

                //Para PROBAR las calles :
                var aObjCarrers = new Array();

                var objCarrer = new carrer();
                objCarrer.ID = 0;
                objCarrer.TIPUS = 'Carrer';
                objCarrer.CARRER = 'Logistica';
                guardaObjetoLocal('CARRER_0', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 1;
                objCarrer.TIPUS = 'Carrer';
                objCarrer.CARRER = 'Ramón i Cajal';
                guardaObjetoLocal('CARRER_1', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 2;
                objCarrer.TIPUS = 'Avinguda';
                objCarrer.CARRER = 'Lluis Companys';
                guardaObjetoLocal('CARRER_2', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 3;
                objCarrer.TIPUS = 'Camí';
                objCarrer.CARRER = 'Riera';
                guardaObjetoLocal('CARRER_3', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 4;
                objCarrer.TIPUS = 'Carrer';
                objCarrer.CARRER = 'de Tuset';
                guardaObjetoLocal('CARRER_4', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 5;
                objCarrer.TIPUS = 'Passeig';
                objCarrer.CARRER = 'Fluvial';
                guardaObjetoLocal('CARRER_5', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 6;
                objCarrer.TIPUS = 'Carrer';
                objCarrer.CARRER = 'de la Granada del Penedès';
                guardaObjetoLocal('CARRER_6', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 7;
                objCarrer.TIPUS = 'Carrer';
                objCarrer.CARRER = 'de Moià';
                guardaObjetoLocal('CARRER_7', objCarrer);

                objCarrer = new carrer();
                objCarrer.ID = 8;
                objCarrer.TIPUS = 'Avinguda';
                objCarrer.CARRER = 'Diagonal';
                guardaObjetoLocal('CARRER_8', objCarrer);
            }
            catch(e){ mensaje('exception creant carrers : ' + e.message,'error'); }

        }
}

// -------- COMUNES -----------------------------------------------------------------------

function abrirPagina(sPag, bBack) {
    $.mobile.changePage('#' + sPag, {
        transition: "flip",
        reverse: true,
        changeHash: bBack
    });

    sCambioPagina = sPag;
    switch(sCambioPagina)
    {
        case 'pageNuevaIncidencia' :
            //Abrir el acordeón para actualizar el plano
            $("#collapsibleLocalizacion").trigger("expand");
            //espero a que esté cargado el div para que se renderice bien el plano ...
            setTimeout(inicializa,1000);
            break;

        case 'pageConsultaIncidencias' :
            inicioPaginaConsultaIncidencias();
            //espero a que esté cargado el div para que se renderice bien el plano ...
            setTimeout(inicializa,1000);
            break;

        case 'pageZoomFoto' :
            var imagen = document.getElementById('imgZoomFoto');
            imagen.style.display = 'block';
            imagen.src = "data:image/jpeg;base64," + sFoto;
            sCambioPagina = '';
            break;
    }
}

function inicializa(){
    switch(sCambioPagina)
    {
        case 'pageNuevaIncidencia' :
            inicioPaginaNuevaIncidencia();
            break;

        case 'pageConsultaIncidencias' :
            mostrarEnPlano();
            break;
    }
    sCambioPagina = '';
}

function limpiaVariables(sPag){
    switch(sPag)
    {
        case 'pageNuevaIncidencia' :
            sFoto = '';
            sDireccionAlta = '';
            posAlta = '';
            mapAlta = null;
            $('#labelComentari').text('');
            $('#textareaComentari').val('');
            $('#inputNUM').val('');
            $('#labelDireccion').text('');
            $('#selectCARRER').text('');
            break;

        case 'pageConsultaIncidencias' :
            sDireccionConsulta = '';
            posConsulta = '';
            mapConsulta = null;
            break;

    }
}





