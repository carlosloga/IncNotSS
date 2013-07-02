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

function usuari(aDatosUsuari) {
    try {
        this.ID = aDatosUsuari['id'];
        this.NOM = aDatosUsuari['nom'] + '';
        this.COGNOM1 = aDatosUsuari['cognom1'] + '';
        this.COGNOM2 = aDatosUsuari['cognom2'] + '';
        this.DNI  = aDatosUsuari['dni'] + '';
        this.EMAIL  = aDatosUsuari['email'] + '';
        this.TELEFON = aDatosUsuari['telefon'] + '';
        return this;
    } catch (e) { alert('en creant objecte : usuari  ERROR : ' + e.Message); }
}

