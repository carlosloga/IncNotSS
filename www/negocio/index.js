// funciones COMUNES -----------------------------------------------------------------------
var pictureSource;
var destinationType;
var sCambioPagina = '';
var aGlobalCarrers = null;
var bSequelOK = false;
var bWebSqlOK = false;
var globalBD = null;

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

    bWebSqlOK = false;
    bSequelOK = false;

    //Cargar/crear la B.D.
    var bSSready = false;
    db.onready(function() {
        bSSready = true;
        try
        {
            if(!localStorageSupport())
            {
                $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : localStorage no soportat');
            }

            //Si se crea/abre/carga correctamente Sequelsphere, esta function actualizará
            //el boolean 'bSequelOK' a true ...
            cargarBD();

            $.doTimeout(1000, function () {
                cargarBDwebSQL('1');
            });
        }
        catch(e)
        {
            mensaje('error : ' + e);
        }
    });

    $.doTimeout(1000, function () {
        if(!bSSready)cargarBDwebSQL('2');
    });
}

function cargarBDwebSQL(n){
    if(bSequelOK) return;

    globalBD = null;
    cargarBDSql();
    $.doTimeout(2000, function () {
        cargarBDwebSQLresultado();
    });
}

function cargarBDwebSQLresultado(){
    if(globalBD == null || (bWebSqlOK == false && bSequelOK == false) ) {
        estadoBoton('buttonALTA', false);
        estadoBoton('buttonCONSULTA', false);
        $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : Bases de dades no soportades');
        return;
    }

    var sCreateTables = getEstructuraTablas("TOT_TABLAS");
    if(sCreateTables != null && sCreateTables.trim() != '')
    {
        var aCreateTables = new Array();
        aCreateTables = sCreateTables.split(";");
        if(aCreateTables.length > 0)
        {
            for(var x=0; x < aCreateTables.length ; x++)
            {
                BDsentenciaSql(aCreateTables[x] , [], true , null, null );
            }

            //Para PROBAR las calles (en real deberian bajar de un WS)
            var aObjCarrers = new Array();

            var objCarrer = new carrer();

            objCarrer.ID = 0;
            objCarrer.TIPUS = 'Carrer';
            objCarrer.CARRER = 'Logistica';
            aObjCarrers[0] = objCarrer;

            objCarrer = new carrer();
            objCarrer.ID = 1;
            objCarrer.TIPUS = 'Carrer';
            objCarrer.CARRER = 'Ramón i Cajal';
            aObjCarrers[1] = objCarrer;

            objCarrer = new carrer();
            objCarrer.ID = 2;
            objCarrer.TIPUS = 'Avinguda';
            objCarrer.CARRER = 'Lluis Companys';
            aObjCarrers[2] = objCarrer;

            objCarrer = new carrer();
            objCarrer.ID = 3;
            objCarrer.TIPUS = 'Camí';
            objCarrer.CARRER = 'Riera';
            aObjCarrers[3] = objCarrer;

            objCarrer = new carrer();
            objCarrer.ID = 4;
            objCarrer.TIPUS = 'Carrer';
            objCarrer.CARRER = 'de Tuset';
            aObjCarrers[4] = objCarrer;

            objCarrer = new carrer();
            objCarrer.ID = 5;
            objCarrer.TIPUS = 'Passeig';
            objCarrer.CARRER = 'Fluvial';
            aObjCarrers[5] = objCarrer;

            for(var x=0; x < aObsCarrers.length; x++)
                guardaObjetoEnBD('CARRERS',aObjCarrers[x],null,null);
        }
    }
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





