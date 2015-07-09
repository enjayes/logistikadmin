/**
 * nachrichtenTab
 *
 *
 *
 *
 * @date 27.11.14 - 22:47
 *
 */



nachrichtenTab = {
    anchorName: "nachrichtenTab",
    controller: nachrichtenController,
    searchWidget: null,
    selectedItemsAnHtml:"",
    nachrichtenMarktSelectionWidget:null,
    showStep:10,
    showMax:10,
    init: function () {
        var that = this;

        var selectedList = $("#selectedMessageLieferanten");
        this.selectedItemsAnHtml = "<div class='selectedLieferantAn'>An:</div><div class='selectedLieferantAnMargin'></div>"
        selectedList.click(function (event) {
            event.stopPropagation();
            $("#searchMessageLieferanten input").focus();
        })

        this.searchWidget = new SearchWidget("#searchMessageLieferanten", "Suche nach Lieferanten...", 5, true, function () {
                nachrichtenTab.searchWidget.getInput().val("");
                nachrichtenTab.renderSelectedLieferanten();
                CKEDITOR.instances.messageLieferantenCKEditor.focus();
            },
            function (lieferant, classes) {
                return "<li class='" + classes + "'><a>" + lieferantenController.getLieferantFullName(lieferant) + "</a></li>";
            },
            function (visible, top, height) {
                $("#pagecontent").css("min-height", visible ? top + height : "");
            }
        );


        //Markt auswahl
        this.nachrichtenMarktSelectionWidget = new MultipleSelectionWidget("#nachrichtenMarktSelection");

        //Editor
        CKEDITOR.replace('messageLieferantenCKEditor');
        CKEDITOR.instances.messageLieferantenCKEditor.on('change', that.disableSendButton);

    }, ready: function () {


    },

    open: function () {


    },
    aktuellerSubTab: 0,
    openSubTab: function (index) {
        if (this.aktuellerSubTab != index) {
            this.aktuellerSubTab = index
            this.showMax = this.showStep;

            //Reset displaced Items to max number
            nachrichtenController.nachrichtenSent = nachrichtenController.nachrichtenSent.slice(0,this.showMax);
            if(nachrichtenController.nachrichtenSent.length>=nachrichtenController.nachrichtenSentLength)
             $("#showMoreSentMessages").hide();
            else
              $("#showMoreSentMessages").show();

            nachrichtenController.nachrichtenRecieved = nachrichtenController.nachrichtenRecieved.slice(0,this.showMax);
            if(nachrichtenController.nachrichtenRecieved.length>=nachrichtenController.nachrichtenRecievedLength)
                $("#showMoreReceivedMessages").hide();
            else
                $("#showMoreReceivedMessages").show();

            $("#writeMessageTabs .ui-btn").removeClass("active");

            $(".messageTab").hide();

            //Schreiben
            if (index == 0) {
                $("#writeMessage").show();

                $("#writeNewLieferantenMessage").addClass("active");
                //Empfangen
            } else if (index == 1) {
                $("#sentMessage").show();

                $("#sentNewLieferantenMessage").addClass("active");

                nachrichtenController.renderEmpfangeneNachrichten();
                //Gesendet
            } else {

                $("#recievedMessage").show();

                $("#recievedNewLieferantenMessage").addClass("active");

                nachrichtenController.renderGesendeteNachrichten();

            }
        }

    } ,
    disableSendButton: function () {

        if (nachrichtenTab.searchWidget.getSelectedItems().length == 0 || CKEDITOR.instances.messageLieferantenCKEditor.getData().trim() == "") {
            $("#sendMessageLieferant").addClass("ui-disabled")
        } else {
            $("#sendMessageLieferant").removeClass("ui-disabled")
        }
    },
    renderSelectedLieferanten: function () {

        var that = this;

        var renderSelectionList = function () {

            var selectedItems = that.searchWidget.getSelectedItems();

            var selectedList = $("#selectedMessageLieferanten");
            selectedList.html(that.selectedItemsAnHtml);

            if (selectedItems.length > 0)  {

                for (var i = 0; i < selectedItems.length; i++) {   //CHANGE FOR DIFFERENT COMPARISIONS

                    var append = function (item) {
                        selectedList.append($("<div title='" + lieferantenController.getLieferantFullName(item) + "'class='selectedLieferantButton ui-btn'>" + item.name + "</div>").click(function () {
                            event.stopPropagation();


                            lieferantenController.aktuellerLieferant = $.extend(true, {}, item);
                            tabsController.openTabWithoutClick(3);
                            lieferantenController.zeigeAktuellenLieferanten();


                        }).append($("<div title='Entfernen' class='selectedLieferantButtonRemove ui-btn ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-inline ui-shadow ui-corner-all ui-mini'></div>").click(function () {
                                event.stopPropagation();
                                that.searchWidget.deselectedItem(item);
                                that.searchWidget.renderList();
                                renderSelectionList();
                            })));
                    }
                    append(selectedItems[i]);


                }
            }

            that.disableSendButton();
        }
        renderSelectionList();

    }


}