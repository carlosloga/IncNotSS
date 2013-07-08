function getEstructuraTablas(tabla) {
    switch(tabla)
    {
        case "CARRERS" :
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
            break;

        case "COMUNICATS" :
                  return {
                          tableName: "COMUNICATS",
                          columns: [ "ID", "REFERENCIA", "ESTAT", "DATA", "CARRER", "NUM", "COORD_X", "COORD_Y", "COMENTARI", "FOTO1" , "FOTO2", "FOTO3" ],
                          primaryKey: ["ID"],
                          data: []
                      };
            break;

        case "CIUTADA" :
                return {
                        tableName: "CIUTADA",
                        columns: [ "ID", "NOM", "COGNOM1", "COGNOM2", "DNI", "EMAIL", "TELEFON" ],
                        primaryKey: ["ID"],
                        data: []
                    };
            break;

        case "TOT_TABLAS" :
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
            break;
    }
}

function getDatosUsuario(){
    var objUsu = null;
    var nFilas = 0;

    var sSel = "SELECT ID, NOM, COGNOM1, COGNOM2, DNI, EMAIL, TELEFON FROM CIUTADA";  //Sólo hay un registro o ninguno
    try {
        var cursor =  db.queryCursor(sSel);
        var nCampos = cursor.getColumnCount();

        var aDatosUsuari = new Array();

        while (cursor.next())       //Sólo hay un registro o ninguno
        {
            nFilas++;
            for (var col = 0; col < nCampos; ++col)
            {
                if(cursor.getValue(col) == null)
                    aDatosUsuari[cursor.getColumnName(col).toLowerCase()] = '';
                else
                    aDatosUsuari[cursor.getColumnName(col).toLowerCase()] = cursor.getValue(col);
            }
        }

        if(nFilas > 0) objUsu = new usuari(aDatosUsuari);

    }
    catch (err) {
        if (err instanceof Exception)
            //sHtmlRes = "<pre>" + err.getVerboseErrorMessage() + "</pre>";
            return null;
        else
            //sHtmlRes = "Unknown Exception: " + err;
            return null;
    }

    return objUsu;
}

function getCarrers(){
    aGlobalCarrers = new Array();

    var sSel = "SELECT ID, TIPUS, CARRER FROM CARRERS ORDER BY CARRER,TIPUS";
    var aDatosCarrer = new Array();
    var objCarrer = null;

    var n=0;
    try {
        var cursor =  db.queryCursor(sSel);
        while (cursor.next()){
            aDatosCarrer['id'] = cursor.getValue(0);
            aDatosCarrer['tipus'] = cursor.getValue(1);
            aDatosCarrer['carrer'] = cursor.getValue(2);
            objCarrer = new carrer(aDatosCarrer);
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

    var sSel = "Select ID, REFERENCIA, ESTAT, DATA, CARRER, NUM, COORD_X, COORD_Y, COMENTARI From COMUNICATS Order By ID DESC";

    var aDatosComunicat = new Array();
    var objComunicat = null;

    var n=0;
    try {
        var cursor =  db.queryCursor(sSel);
        while (cursor.next()){
            aDatosComunicat['id'] = cursor.getValue(0);
            aDatosComunicat['referencia'] = cursor.getValue(1);
            aDatosComunicat['estat'] = cursor.getValue(2);
            aDatosComunicat['data'] = cursor.getValue(3);
            aDatosComunicat['carrer'] = cursor.getValue(4);
            aDatosComunicat['num'] = cursor.getValue(5);
            aDatosComunicat['coord_x'] = cursor.getValue(6);
            aDatosComunicat['coord_y'] = cursor.getValue(7);
            aDatosComunicat['comentari'] = cursor.getValue(8);

            objComunicat = new comunicat(aDatosComunicat);
            aComunicats[n++] = objComunicat;
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

