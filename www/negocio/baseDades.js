function cargarBD() {
    try {
        //inicializar la BD
        if (db.catalog.getTable("CIUTADA") == null) {
            alert('Creant B.D.');
            var data = getEstructuraTablas();
            db.catalog.createTables(data);
            db.catalog.setPersistenceScope(db.catalog.SCOPE_LOCAL);
            db.commit({
                onsuccess: function() {
                    window.alert("B.D. OK");
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




