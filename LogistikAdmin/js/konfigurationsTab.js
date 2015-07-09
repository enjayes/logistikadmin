/**
 * konfigurationsTab
 *
 *
 * @author
 * @date 13.12.14 - 19:57
 * @copyright
 */




konfigurationsTab = {
    anchorName: "konfigurationsTab",
    controller: konfigurationsController,
    konfigurationsMarktSelectionWidget:null,
    init: function () {

        //Markt auswahl
        this.konfigurationsMarktSelectionWidget = new MultipleSelectionWidget("#konfigurationMarktSelection",true);


    },
    ready: function () {





    },
    open: function () {





    }
}