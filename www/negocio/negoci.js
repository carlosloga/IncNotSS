function getEstructuraTablas() {
    return [
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
        },
        {
            tableName: "CARRERS",
            columns: [ "ID" , "TIPUS" , "CARRER" ],
            primaryKey: ["ID"],
            data: [
                [0,"c.","Logística"],
                [1,"c.","Ramon i Cajal"],
                [2,"av." ,"Lluis companys"],
                [3,"camí","Riera"],
                [4,"passeig", "Fluvial"]
            ]
        }
    ];
}

function getDatosUsuario()
{
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


