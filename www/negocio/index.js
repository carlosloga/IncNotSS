// funciones COMUNES -----------------------------------------------------------------------
var pictureSource;
var destinationType;
var sCambioPagina = '';
var aGlobalCarrers = null;

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

    //Cargar/crear la B.D.
    db.onready(function() {
        mensaje('db ready', 'info');
        try
        {
            if(!localStorageSupport())
            {
                mensaje("localStorage no soportat ","atenció");
                //return;
            }

            setTimeout("cargarBD()", 500);
        }
        catch(e)
        {
            mensaje('error : ' + e);
        }
    });
}

// -------- COMUNES -----------------------------------------------------------------------

function abrirPagina(sPag) {
    $.mobile.changePage('#' + sPag, {
        transition: "flip",
        reverse: false,
        changeHash: true
    });

    sCambioPagina = sPag;
    switch(sCambioPagina)
    {
        case 'pageNuevaIncidencia' :
            //Abrir el acordeón para actualizar el plano
            $("#collapsibleLocalizacion").trigger("expand");
            break;

        case 'pageConsultaIncidencias' :
            inicioPaginaConsultaIncidencias();
            break;
    }

    //espero a que esté cargado el div para que se renderice bien el plano ...
    setTimeout(inicializa,1000);
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

            break;

        case 'pageConsultaIncidencias' :
            sDireccionConsulta = '';
            posConsulta = '';
            mapConsulta = null;
            break;

    }
}





