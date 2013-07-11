
// --------------------  B.D. SequelSphere ---------------------------
function cargarBD() {
    try {
        //inicializar la BD
        if (db.catalog.getTable("CIUTADA") == null) {
            var data = getEstructuraTablas("TOT_TABLAS");
            db.catalog.createTables(data);
            db.catalog.setPersistenceScope(db.SCOPE_LOCAL);
            db.commit({
                onsuccess: function() {
                    db.catalog.getTable("CARRERS").setPersistenceScope(db.SCOPE_LOCAL);
                    db.catalog.getTable("CIUTADA").setPersistenceScope(db.SCOPE_LOCAL);
                    db.catalog.getTable("COMUNICATS").setPersistenceScope(db.SCOPE_LOCAL);
                },
                onerror: function(errStr) {
                    //mensaje("B.D. error : " + errStr);
                    $('#labelInfo').text($('#labelInfo').text() + '\nB.D. error : ' + errStr);
                }
            });
        }
        bSequelOK = true;
    }
    catch(err) {
        bSequelOK = false;
/*        if (err instanceof Exception) {
            mensaje('ERROR : ' + err.getVerboseMessage());
        }
        else {*/
            //mensaje('ERROR en B.D.');
            $('#labelInfo').text($('#labelInfo').text() + '\nB.D. ERROR : ' + err.code);
        /* } */
    }
}

function cargarBDtabla(tabla) {
    try {
            var data = getEstructuraTablas(tabla);
            db.catalog.createTable(data);
            db.catalog.setPersistenceScope(db.SCOPE_LOCAL);
            db.commit({
                onsuccess: function() {
                    db.catalog.getTable(tabla).setPersistenceScope(db.SCOPE_LOCAL);
                },
                onerror: function(errStr) {
                    mensaje("B.D. error : " + errStr);
                }
            });
    }
    catch(err) {
        if (err instanceof Exception) {
            mensaje('ERROR : ' + err.getVerboseMessage());
        }
        else {
            mensaje('ERROR : ' + err);
        }
    }
}

function sincroBD(tabla){
    db.catalog.dropTable(tabla);

    db.commit({
        onsuccess: function() {
            cargarBDtabla(tabla);
        },
        onerror: function(errStr) {
            mensaje("B.D. error el·liminant taula CARRERS : " + errStr);
        }
    });
}

// --------------------  B.D. Web Sql --------------------------------
function cargarBDSql(){
    try {
        if (!window.openDatabase) {
            bWebSqlOK = false;
            //mensaje('openDatabase NO ESTÀ SOPORTAT EN AQUEST DISPOSITIU','error');
            $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : openDatabase NO ESTÀ SOPORTAT EN AQUEST DISPOSITIU');
            return false;
        } else {
            globalBD = openDatabase('BdComunicats', '1.0', 'BdComunicats', 5 * 1024 * 1024);
            bWebSqlOK = true;
            return true;
        }
    }
    catch (e) {
        globalBD = null;
        bWebSqlOK = false;
        // Error handling code goes here.
        if (e == INVALID_STATE_ERR) {
            // Version number mismatch.
            //mensaje('Versió de Base de Dades no vàlida','error');
            $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : Versió de Base de Dades no vàlida');
        } else {
            //mensaje(e.message,'error');
            $('#labelInfo').text($('#labelInfo').text() + '\nAtenció : ' + e.message);
        }
        return false;
    }
}

function BDsentenciaSql(sQuery, aParams, bMuestraError, funcion, pasaParam) {
    if (globalBD == null) {
        globalBD_RESULTADO = 'ERROR : No s´ha obert la Base de Dades';
        // mensaje("No s'ha obert la Base de Dades en : " + sQuery + " amb : " + aParams , 'error');
        $('#labelInfo').text($('#labelInfo').text() + "\nBase de Dades no oberta (en : " + sQuery + " amb : " + aParams + ")");
        return;
    }

    var posibleError = '';
    try {
        var aPar = [];
        var sDev = '';
        if (aParams.length > 0) {
            for (var x = 0; x < aParams.length; x++) aPar[x] = [aParams[x]];
        }
        globalBD.transaction(
            function (transaction) {
                var query = sQuery;
                transaction.executeSql(
                    query,
                    aPar,
                    function (transaction, result) {
                        sDev = 'OK';
                        if (funcion != null)
                            funcion('OK', pasaParam);
                    },
                    function (transaction, error) {
                        if (error.message.trim() === "not an error") {
                                posibleError = 'OK';
                        }
                        else {
                            posibleError = error.message + ' en : ' + sQuery + ' amb : ' + aParams;
                            if (bMuestraError) mensaje(posibleError , 'error');
                        }
                        sDev = posibleError;
                        if (funcion != null) funcion(posibleError, pasaParam);
                    } // = rollback
                );
            }
        );

        if (funcion == null) return sDev;
    }
    catch (e) {
        posibleError = '(Exception en BDsentenciaSql) : ' + e.message;
        mensaje(posibleError + ' en : ' + sQuery + ' amb : ' + aParams , 'error');
    }

}

function BDsentenciaSqlDEV(sQuery, aParams, bMuestraError, funcion, pasaParam) {
    if (globalBD == null) {
        mensaje("No s'ha obert la Base de Dades en : " + sQuery + " amb : " + aParams);
        return;
    }

    var datosDev = null;
    try {
        var aPar = [];
        if (aParams != null && aParams.length > 0) {
            for (var x = 0; x < aParams.length; x++) { aPar[x] = [aParams[x]]; }
        }
        globalBD.transaction(
            function (transaction) {
                transaction.executeSql(
                    sQuery,
                    aPar,
                    function (transaction, result) {
                        datosDev = result;
                        if (funcion != null) funcion(result, pasaParam);
                    },
                    function (transaction, error) {
                        datosDev = 'ERROR : ' + lista_ERROR_SQL[error.code] + ' : ' + error.message + ' en : ' + sQuery + ' amb : ' + aParams;
                        if (bMuestraError) mensaje(datosDev , 'error');
                        if (funcion != null) funcion(datosDev, pasaParam);
                    } // = rollback
                );
            }
        );

        if (funcion == null) return datosDev;
    }
    catch (e) {
        datosDev = '(exception en BDsentenciaDEV) : ' + e.message;
        mensaje(datosDev + ' en : ' + sQuery + ' amb : ' + aParams , 'error');
        if (funcion != null) funcion(datosDev + ' en : ' + sQuery + ' amb : ' + aParams , pasaParam);
    }
}
