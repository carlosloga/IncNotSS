// funciones COMUNES -----------------------------------------------------------------------
var pictureSource;
var destinationType;
var sCambioPagina = '';

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
        try
        {
            setTimeout("cargarBD()", 500);
        }
        catch(e)
        {
            alert('error : ' + e);
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
            $("#collapsibleLocalizacion").trigger("expand");
            break;

        case 'pageConsultaIncidencias' :
            iniciaMapaConsulta();
            break;
    }

    //espero a que esté cargado el div para que se renderice bien el plano ...
    setTimeout(inicializa,1000);
}

function inicializa(){
    //alert('ya ' + sCambioPagina);

    switch(sCambioPagina)
    {
        case 'pageNuevaIncidencia' :

            //cargar los datos del usuario (ciutadà)
            var objUsu = getDatosUsuario();
            if(objUsu == null)
                alert("Error consultant dades de l'usuari");
            else
            {
                $('#inputNOM').val(objUsu['NOM']) ;
                $('#inputCOGNOM1').val(objUsu['COGNOM1']);
                $('#inputCOGNOM2').val(objUsu['COGNOM2']);
                $('#inputDNI').val(objUsu['DNI']);
                $('#inputEMAIL').val(objUsu['EMAIL']);
                $('#inputTELEFON').val(objUsu['TELEFON']);

                $('#labelQUISOC').text(objUsu['NOM'] + ' ' + objUsu['COGNOM1'] + ' ' + objUsu['COGNOM2'] );
            }

            iniciaMapaAlta(true);
            break;

        case 'pageConsultaIncidencias' :
            iniciaMapaConsulta();
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




