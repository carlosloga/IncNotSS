var objCarrer = new Object();

objCarrer.ID = 0;
objCarrer.TIPUS = '';
objCarrer.CARRER = '';

function carrer() {
    return objCarrer;
}

function carrer(aDatos) {
    try {
        this.ID = aDatos['id'];
        this.TIPUS = aDatos['tipus'] + '';
        this.CARRER = aDatos['carrer'] + '';
        return this;
    } catch (e) { alert('en creant objecte : carrer  ERROR : ' + e.Message); }
}


