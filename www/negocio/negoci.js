
function getEstructuraTablas(tabla) {
    switch(tabla)
    {
        case "CARRERS" :
            if(bSequelOK)
            {
                return {
                    tableName: "CARRERS",
                    columns: [ "ID" , "TIPUS" , "CARRER" ],
                    primaryKey: ["ID"],
                    data: [
                        [0,"Carrer","Logística"],
                        [1,"Carrer","Ramon i Cajal"],
                        [2,"Avinguda" ,"Lluis companys"],
                        [3,"Camí","Riera"],
                        [4,"Carrer" ,"de Tuset"],
                        [5,"Passeig", "Fluvial"]
                    ]
                };
            }
            else
            {
                return "CREATE TABLE IF NOT EXISTS CARRER (ID unique, TIPUS , CARRER)";
            }
            break;

        case "COMUNICATS" :
            if(bSequelOK)
            {
                  return {
                          tableName: "COMUNICATS",
                          columns: [ "ID", "REFERENCIA", "ESTAT", "DATA", "CARRER", "NUM", "COORD_X", "COORD_Y", "COMENTARI", "FOTO1" , "FOTO2", "FOTO3" ],
                          primaryKey: ["ID"],
                          data: []
                      };
            }
            else
            {
                return "CREATE TABLE IF NOT EXISTS COMUNICATS (ID unique, REFERENCIA, ESTAT, DATA, CARRER, NUM, COORD_X, COORD_Y, COMENTARI, FOTO1, FOTO2, FOTO3)";
            }
            break;

        case "CIUTADA" :
            if(bSequelOK)
            {
                return {
                        tableName: "CIUTADA",
                        columns: [ "ID", "NOM", "COGNOM1", "COGNOM2", "DNI", "EMAIL", "TELEFON" ],
                        primaryKey: ["ID"],
                        data: []
                    };
            }
            else
            {
                return "CREATE TABLE IF NOT EXISTS CIUTADA (ID unique, NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON)";
            }
            break;

        case "TOT_TABLAS" :
            if(bSequelOK)
            {
                return [
                    {
                        tableName: "CARRERS",
                        columns: [ "ID" , "TIPUS" , "CARRER" ],
                        primaryKey: ["ID"],
                        data: [
                            [0,"Carrer","Logística"],
                            [1,"Carrer","Ramon i Cajal"],
                            [2,"Avinguda" ,"Lluis companys"],
                            [3,"Camí","Riera"],
                            [4,"Carrer" ,"de Tuset"],
                            [5,"Passeig", "Fluvial"]
                        ]
                    },
                    {
                        tableName: "COMUNICATS",
                        columns: [ "ID", "REFERENCIA", "ESTAT", "DATA", "CARRER", "NUM", "COORD_X", "COORD_Y", "COMENTARI", "FOTO1" , "FOTO2", "FOTO3" ],
                        primaryKey: ["ID"],
                        data: []
                    },
                    {
                        tableName: "CIUTADA",
                        columns: [ "ID", "NOM", "COGNOM1", "COGNOM2", "DNI", "EMAIL", "TELEFON" ],
                        primaryKey: ["ID"],
                        data: []
                    }
                ];
            }
            else
            {
                return "CREATE TABLE IF NOT EXISTS CARRER (ID unique, TIPUS , CARRER); CREATE TABLE IF NOT EXISTS COMUNICATS (ID unique, REFERENCIA, ESTAT, DATA, CARRER, NUM, COORD_X, COORD_Y, COMENTARI, FOTO1, FOTO2, FOTO3); CREATE TABLE IF NOT EXISTS CIUTADA (ID unique, NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON)";
            }
            break;
    }
}

function getDatosUsuario(){
    var objUsu = null;
    //var sSel = "SELECT ID, NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON FROM CIUTADA";  //Sólo hay un registro o ninguno
    try {
        objUsu = leeObjetoLocal('CIUTADA', 'NO_EXISTE');
        if(objUsu == 'NO_EXISTE')
            return null;
        else
            return objUsu;
    }
    catch (err) {
        mensaje('Error obtenint dades ciutadà : ' + err.message);
        return null;
    }
}

function getCarrers(){
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
}

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
    return aDatosCom;
}

function getCadenaComunicat(objComunicat , separador){
    var sDev = "";
    try
    {
        sDev += objComunicat.ID + separador;
        sDev += objComunicat.REFERENCIA + separador;
        sDev += objComunicat.ESTAT + separador;
        sDev += objComunicat.DATA + separador;
        sDev += objComunicat.CARRER + separador;
        sDev += objComunicat.NUM + separador;
        sDev += objComunicat.COORD_X + separador;
        sDev += objComunicat.COORD_Y + separador;
        sDev += objComunicat.COMENTARI + separador;
    }
    catch(e){
        mensaje('ERROR (exception) en getCadenaComunicat : : \n' + e.code + '\n' + e.message);
    }
    return sDev;
}

