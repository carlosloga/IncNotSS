// funciones COMUNES -----------------------------------------------------------------------
var pictureSource;
var destinationType;
var sCambioPagina = '';
var aGlobalCarrers = null;
var aCarrers = null;
var aConfig = null;

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
                cargaConfigEnArray();
            }
            catch(e){ mensaje('exception carregant llista de carrers : ' + e.message,'error'); }
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
            $('#divContieneMapa').show();
            $('#divMapaAlta').show();
            //espero a que esté cargado el div para que se renderice bien el plano ...
            setTimeout(inicializarPagina,1000);
            break;

        case 'pageConsultaIncidencias' :
            inicioPaginaConsultaIncidencias();
            //espero a que esté cargado el div para que se renderice bien el plano ...
            setTimeout(inicializarPagina,1000);
            break;

        case 'pageZoomFoto' :
            var imagen = document.getElementById('imgZoomFoto');
            imagen.style.display = 'block';
            imagen.src = "data:image/jpeg;base64," + sFoto;
            sCambioPagina = '';
            break;
    }
}

function inicializarPagina(){
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





