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
                    mensaje("B.D. error : " + errStr);
                }
            });
        }
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




