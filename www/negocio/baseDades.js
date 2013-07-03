function cargarBD() {
    try {
        //inicializar la BD
        if (db.catalog.getTable("CIUTADA") == null) {
            alert('Creant B.D.');
            var data = getEstructuraTablas();
            db.catalog.createTables(data);
            db.catalog.setPersistenceScope(db.SCOPE_LOCAL);
            db.commit({
                onsuccess: function() {
                    db.catalog.getTable("CIUTADA").setPersistenceScope(db.SCOPE_LOCAL);
                    db.catalog.getTable("COMUNICATS").setPersistenceScope(db.SCOPE_LOCAL);
                    db.catalog.getTable("CARRERS").setPersistenceScope(db.SCOPE_LOCAL);
                    window.alert("B.D. OK");
                    var sco = db.catalog.getPersistenceScope();
                    alert('Scope = ' + sco);
                },
                onerror: function(errStr) {
                    window.alert("B.D. error : " + errStr);
                }
            });
        }
        else
            alert('B.D. ja existeix');
    }
    catch(err) {
        if (err instanceof Exception) {
            alert('ERROR : ' + err.getVerboseMessage());
        }
        else {
            alert('ERROR : ' + err);
        }
    }
}




