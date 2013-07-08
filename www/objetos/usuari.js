var objUsuari = new Object();

objUsuari.ID = 0;
objUsuari.NOM = '';
objUsuari.COGNOM1 = '';
objUsuari.COGNOM2 = '';
objUsuari.DNI = '';
objUsuari.EMAIL = '';
objUsuari.TELEFON = '';

function usuari() {
    return objUsuari;
}

function usuari(aDatos) {
    try {
        this.ID = aDatos['id'];
        this.NOM = aDatos['nom'] + '';
        this.COGNOM1 = aDatos['cognom1'] + '';
        this.COGNOM2 = aDatos['cognom2'] + '';
        this.DNI  = aDatos['dni'] + '';
        this.EMAIL  = aDatos['email'] + '';
        this.TELEFON = aDatos['telefon'] + '';
        return this;
    } catch (e) { alert('en creant objecte : usuari  ERROR : ' + e.Message); }
}

