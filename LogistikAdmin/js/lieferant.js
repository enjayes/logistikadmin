/**
 * lieferant.
 *
 *
 *
 *
 * @date 19.11.14 - 23:46
 *
 */



lieferant = function(vorname,name){
    this.id = misc.getUniqueID();
    this.pin = lieferantenController.defaultPin;
    this.vorname = vorname;
    this.name = name;
    this.telefon="";
    this.email="";
    this.adresse="";
    this.notizen="";
    this.firma="";
}