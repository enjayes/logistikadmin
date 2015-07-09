/**
 * konfigurationsController
 *
 *
 * @author
 * @date 13.12.14 - 21:11
 * @copyright
 */



konfigurationsController = {
    aktuellerMarkt:null,
    aktuellerMarktGespeichert:true,
    init: function () {

        var setNotSavedView = function(){
            konfigurationsController.aktuellerMarktGespeichert = false;
            $("#speichereMarkt").css("opacity", 1).removeClass("ui-disabled");
            $("#rueckgaengigMarkt").css("opacity", 1).removeClass("ui-disabled");
        }



        $("#marktInformationen input, #marktInformationen textarea ").on("input", function () {
            setNotSavedView();
        })

        $("#smsinfo").change(function() {
            setNotSavedView();
        })

        $("#callinfo").change(function() {
            setNotSavedView();
        })


    },
    ready:function(){



    },
    setMaerkte:function(maerkte){

        konfigurationsTab.konfigurationsMarktSelectionWidget.setData(uebersichtController.maerkte,konfigurationsController.zeigeMarkt,true);

    },
    zeigeMarkt:function(markt){

        if(markt&&markt.id!=undefined){

            konfigurationsController.aktuellerMarkt = markt;

            $("#markttelefon").val(markt.telefon);
            $("#marktemails").val(markt.emails);

            $('#smsinfo').prop('checked',markt.sms);

            $('#callinfo').prop('checked',markt.call);
            $('#smsinfo').checkboxradio("refresh");
            $('#callinfo').checkboxradio("refresh");



            this.aktuellerMarktGespeichert=true;
            $("#speichereMarkt").css("opacity", 0).addClass("ui-disabled");
            $("#rueckgaengigMarkt").css("opacity", 0).addClass("ui-disabled");
        }

    },
    speichereAktuellenMarkt: function () {

        if (this.aktuellerMarkt) {

            var validated = true; // TODO ggf validation
            if (validated) {

                this.aktuellerMarkt.telefon = $("#markttelefon").val();
                this.aktuellerMarkt.emails = $("#marktemails").val();

                if ($('#smsinfo').is(":checked")) {
                    this.aktuellerMarkt.sms =true;
                }
                else{
                    this.aktuellerMarkt.sms =false;
                }
                if ($('#callinfo').is(":checked")) {
                    this.aktuellerMarkt.call =true;
                }
                else{
                    this.aktuellerMarkt.call =false;
                }


                console.log("speichereAktuellenMarkt");
                console.log( this.aktuellerMarkt);

                this.aktuellerMarktGespeichert = true;

                $("#speichereMarkt").css("opacity", 0).addClass("ui-disabled");
                $("#rueckgaengigMarkt").css("opacity", 0).addClass("ui-disabled");


                //Update Server DB
                serverController.markt.update(this.aktuellerMarkt);

            }
        }
    }, abbrechenBearbeitungAktuellerMarkt: function () {

        konfigurationsController.zeigeMarkt(konfigurationsController.aktuellerMarkt);


    }

}