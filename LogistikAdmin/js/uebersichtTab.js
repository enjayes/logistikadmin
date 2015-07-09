/**
 * uebersichtTab
 *
 *
 *
 *
 * @date 19.11.14 - 22:19
 *
 */

uebersichtTab = {
    anchorName: "uebersichtTab",
    controller: uebersichtController,
    pieAufteilung:0,
    searchWidget:null,
    selectedItemsShowHtml:"",
    auftragsHistorieMarktSelectionWidget:null,
    init: function () {
        uebersichtTab.pieAufteilung = new PieChart("#aufteilungChart",[]);

        var selectedList = $("#selectedAuftragsHistorieLieferanten");
        this.selectedItemsShowHtml = "<div class='selectedLieferantShow'>Kein Lieferant ausgewählt...</div><div class='selectedLieferantShowMargin'></div>"
        selectedList.click(function (event) {
            event.stopPropagation();
            $("#searchAuftragsHistorieLieferanten input").focus();
        })

        this.searchWidget = new SearchWidget("#searchAuftragsHistorieLieferanten", "Suche nach Lieferanten...", 5, true, function () {
                uebersichtTab.searchWidget.getInput().val("");
                uebersichtTab.renderSelectedLieferanten();
                uebersichtController.updateAuftragsHistorie();
            },
            function (lieferant, classes) {
                return "<li class='" + classes + "'><a>" + lieferantenController.getLieferantFullName(lieferant) + "</a></li>";
            },
            function (visible, top, height) {
                $("#pagecontent").css("min-height", visible ? top + height : "");
            }
        );

        //Markt auswahl
        this.auftragsHistorieMarktSelectionWidget = new MultipleSelectionWidget("#auftragsHistorieMarktSelection",false,function(){
            uebersichtController.updateAuftragsHistorie();
        });
    },

    ready: function () {


    },

    open: function () {


    },
    aktuellerSubTab: 0,
    openSubTab: function (index) {
        if (this.aktuellerSubTab != index) {
            this.aktuellerSubTab = index

            $("#uebersichtMessageTabs .ui-btn").removeClass("active");

            $(".uebersichtTab").hide();

            if (index == 0) {
                $("#historieTab").show();
                $("#showAuftragsHistorieTab").addClass("active");

                //Empfangen
            } else if (index == 1) {
                $("#statistikTab").show();
                $("#showStatistikTab").addClass("active");


            }



        }
    } ,
    renderSelectedLieferanten: function () {

        var that = this;

        var renderSelectionList = function () {

            var selectedItems = that.searchWidget.getSelectedItems();

            var selectedList = $("#selectedAuftragsHistorieLieferanten");

            selectedList.html(that.selectedItemsShowHtml);

            if (selectedItems.length > 0)  {
                selectedList.html("");

                for (var i = 0; i < selectedItems.length; i++) {   //CHANGE FOR DIFFERENT COMPARISIONS

                    var append = function (item) {
                        selectedList.append($("<div title='" + lieferantenController.getLieferantFullName(item) + "'class='selectedLieferantButton ui-btn'>" + item.name + "</div>").click(function () {
                            event.stopPropagation();


                          //  lieferantenController.aktuellerLieferant = $.extend(true, {}, item);
                         //   tabsController.openTabWithoutClick(3);
                        //    lieferantenController.zeigeAktuellenLieferanten();


                        }).append($("<div title='Entfernen' class='selectedLieferantButtonRemove ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-inline ui-shadow ui-corner-all ui-mini'></div>").click(function () {
                                event.stopPropagation();
                                that.searchWidget.deselectedItem(item);
                                that.searchWidget.renderList();
                                renderSelectionList();
                                uebersichtController.updateAuftragsHistorie();

                            })));
                    }
                    append(selectedItems[i]);


                }
            }

        }
        renderSelectionList();
    }


}