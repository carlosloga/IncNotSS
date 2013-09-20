function getDatosUsuario(){
    var objUsu = null;
    //var sSel = "SELECT ID, NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON FROM CIUTADA";  //Sólo hay un registro o ninguno
    try {
        objUsu = leeObjetoLocal('CIUTADA', 'NO_EXISTE');
        if(objUsu == 'NO_EXISTE')
            return new usuari();
        else
            return objUsu;
    }
    catch (err) {
        mensaje('Error obtenint dades ciutadà : ' + err.message);
        return null;
    }
}

/*function getCarrers(){
    aGlobalCarrers = new Array();

    var objCarrer = null;
    var n=0;
    try {
        while (true){
            objCarrer = leeObjetoLocal('CARRER_' + n.toString().trim() , 'NO_EXISTE');
            if(objCarrer == 'NO_EXISTE') break;
            aGlobalCarrers[n++] = objCarrer;
        }
        return aGlobalCarrers;
    }
    catch(e){
        mensaje('Error obtenint el carrers : ' + e);
        return null;
    }
}*/

function getComunicats(){
    var aComunicats = new Array();

    //var sSel = "Select ID, REFERENCIA, ESTAT, DATA, CARRER, NUM, COORD_X, COORD_Y, COMENTARI From COMUNICATS Order By ID DESC";

    var objComunicat = null;
    var nInd = 0;
    var n = leeObjetoLocal('COMUNICATS_NEXTVAL' , 0);
    try {
        while (true){
            objComunicat = leeObjetoLocal('COMUNICAT_' + (n--).toString().trim() , 'NO_EXISTE');
            if(objComunicat == 'NO_EXISTE') break;
            aComunicats[nInd++] = objComunicat;
        }
        return aComunicats;
    }
    catch(e){
        mensaje('Error obtenint els comunicats : ' + e);
        return null;
    }
}

//objComunicat = objeto comunicat
function getArrayComunicat(objComunicat){
    var aDatosCom = new Array();
    aDatosCom['id'] = objComunicat.ID;
    aDatosCom['referencia'] = objComunicat.REFERENCIA;
    aDatosCom['estat'] = objComunicat.ESTAT;
    aDatosCom['data'] = objComunicat.DATA;
    aDatosCom['carrer'] = objComunicat.CARRER;
    aDatosCom['num'] = objComunicat.NUM;
    aDatosCom['coord_x'] = objComunicat.COORD_X;
    aDatosCom['coord_y'] = objComunicat.COORD_Y;
    aDatosCom['comentari'] = objComunicat.COMENTARI;
    aDatosCom['id_msg_mov'] = objComunicat.ID_MSG_MOV;
    return aDatosCom;
}

function getCadenaComunicat(objComunicat , separador){
    var sDev = "";
    try
    {
        sDev += indefinidoOnullToVacio(objComunicat.ID) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.REFERENCIA) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.ESTAT) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.DATA) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.CARRER) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.NUM) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.COORD_X) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.COORD_Y) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.COMENTARI) + separador;
        sDev += indefinidoOnullToVacio(objComunicat.ID_MSG_MOV) + separador;
    }
    catch(e){
        mensaje('ERROR (exception) en getCadenaComunicat : : \n' + e.code + '\n' + e.message);
    }
    return sDev;
}

function cargaCarrersEnArray(){
    if($('#selectLletraIniCARRER').find(":selected").text().trim() == '') return;

    var letraIniCalle = $('#selectLletraIniCARRER').find(":selected").text().trim();

    aCarrers = new Array();

    var aRegistro = null;
    var aCampos = null;
    var r = 0;
    var c = 0;

    $.ajax({
        cache: "true",
        type: "GET",
        url: "tablas/carrers.xml",
        dataType: "xml",
        success: function(datos) {
            $(datos).find("carrer_" + letraIniCalle).each(function () {
                c = 0;
                aRegistro = new Array();
                $(this).children().each(function () {
                    aCampo = new Array(2);
                    aCampo[0] = this.tagName;
                    aCampo[1] = $(this).text();
                    aRegistro[c++] = aCampo;
                });
                aCarrers[r++] = aRegistro;
            });
        },
        error: function(xhr, ajaxOptions, thrownError){
            mensaje("ERROR : " + xhr.status + '\n' + thrownError + '\n' + xhr.responseText , "error");
        },
        async: false
    });
}

function cargaConfigEnArray(){
    aConfig = new Array();

    var aRegistro = null;
    var aCampos = null;
    var r = 0;
    var c = 0;

    $.ajax({
        cache: "true",
        type: "GET",
        url: "tablas/config.xml",
        dataType: "xml",
        success: function(datos) {
            $(datos).find("config").each(function () {
                c = 0;
                aRegistro = new Array();
                $(this).children().each(function () {
                    aCampo = new Array(2);
                    aCampo[0] = this.tagName;
                    aCampo[1] = $(this).text();
                    aRegistro[c++] = aCampo;
                });
                aConfig[r++] = aRegistro;
            });
        },
        error: function(xhr, ajaxOptions, thrownError){
            mensaje("ERROR : " + xhr.status + '\n' + thrownError + '\n' + xhr.responseText , "error");
        },
        async: false
    });
}

function getConfigKey(sKey){
    var sDev = '';
    for(var x=0; x<aConfig[0].length; x++)
    {
        if(aConfig[0][x][0] == sKey)
        {
            sDev = aConfig[0][x][1];
            break;
        }
    }
    return sDev;
}