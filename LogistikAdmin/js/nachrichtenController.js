/**
 * nachrichtenController
 *
 *
 *
 *
 * @date 28.11.14 - 11:52
 *
 */


nachrichtenController = {
    nachrichtenSentLength: 0,
    nachrichtenSent: [],
    nachrichtenRecieved: [],

    init: function () {

    },
    ready: function () {

        serverController.nachricht.getAll(nachrichtenController.handleNachrichtenFromServer, 0, nachrichtenTab.showMax);

        serverController.antwortNachricht.getAll(nachrichtenController.handleAntwortNachrichtenFromServer, 0, nachrichtenTab.showMax);

    },
    handleNachrichtenFromServer: function (nachrichten) {


        nachrichtenController.nachrichtenSentLength = nachrichten.l;

        nachrichten = nachrichten.n;

        nachrichtenController.nachrichtenSent = nachrichtenController.nachrichtenSent.concat(nachrichten);

        if (nachrichtenController.nachrichtenSent.length >= nachrichtenController.nachrichtenSentLength)
            $("#showMoreSentMessages").hide();


        nachrichtenController.renderGesendeteNachrichten();
    },
    handleAntwortNachrichtenFromServer: function (nachrichten) {


        nachrichtenController.nachrichtenRecievedLength = nachrichten.l;

        nachrichten = nachrichten.n;

        nachrichtenController.nachrichtenRecieved = nachrichtenController.nachrichtenRecieved.concat(nachrichten);

        if (nachrichtenController.nachrichtenRecieved.length >= nachrichtenController.nachrichtenRecievedLength)
            $("#showMoreReceivedMessages").hide();

        nachrichtenController.renderEmpfangeneNachrichten();
    },
    ungeleseneNachrichten: 0,
    renderEmpfangeneNachrichten: function () {

        var container = $("#recievedMessageContainer");
        container.html("");
        nachrichtenController.ungeleseneNachrichten = 0;


        //Save opened Collapsibles
        var openedCollapsiblesDom = $("#recievedMessageContainer .ui-collapsible:not(.ui-collapsible-collapsed)");
        var openedCollapsibles = [];
        for (var j = 0; j < openedCollapsiblesDom.length; j++) {
            openedCollapsibles.push(openedCollapsiblesDom[j].id)
        }

        for (var i = 0; i < Math.min(nachrichtenController.nachrichtenRecieved.length, nachrichtenTab.showMax); i++) {
            var nachricht = this.nachrichtenRecieved[i];
            if (!nachricht.read)
                nachrichtenController.ungeleseneNachrichten++;


            var read = nachricht.read ? 'read' : 'unread';


            var lieferanten = "<span>Von: ";

            var lieferant = lieferantenController.getLieferantByID(nachrichtenController.nachrichtenRecieved[i].lieferantid);


            if (lieferant)
                lieferanten += "<a title ='" + lieferantenController.getLieferantFullName(lieferant) + "' class='lieferantMsgButton ui-btn ui-btn-inline ui-mini' >" + lieferant.name + "</a> "
            else
                lieferanten += "<a class='lieferantMsgButton ui-btn ui-btn-inline ui-mini ui-disabled' >Unbekannt</a>";

            lieferanten += '<br /><br /></span>';


            lieferanten = $(lieferanten);

            if (lieferant) {
                var clickLieferant = function (lieferanten, lieferant) {
                    lieferanten.find("a").click(function (event) {
                        event.stopPropagation();
                        lieferantenController.aktuellerLieferant = $.extend(true, {}, lieferant);
                        tabsController.openTabWithoutClick(3);
                        lieferantenController.zeigeAktuellenLieferanten();
                    })
                };
                clickLieferant(lieferanten, lieferant);

            }

            var append = function (nachricht) {

                var nachrichtDom = $('<div id="msgrec' + nachricht.id + '" data-role="collapsible" data-content-theme="false" data-collapsed-icon="carat-d" data-expanded-icon="carat-u" data-iconpos="right">' +
                    '<h4 class="msg' + nachricht.id + ' ' + read + '">' + misc.formatDate(new Date(nachricht.datum)) + "&nbsp&nbsp&nbsp&nbsp&nbsp" + nachricht.nachricht + '</h4>' +
                    '<p>' + nachricht.nachricht +
                    '<a class="deleteMessageButton redbutton ui-btn ui-input-btn ui-btn-b ui-corner-all ui-shadow ui-btn-inline ui-mini ui-icon-delete ui-btn-icon-left">Löschen</a>' +
                    '</p>' +
                    '</div>')

                nachrichtDom.find("h4").click(function () {
                    if (!nachricht.read) {
                        nachricht.read = true;
                        $(".msg" + nachricht.id).addClass("read").removeClass("unread");
                        serverController.antwortNachricht.update(nachricht);

                        nachrichtenController.ungeleseneNachrichten--;
                        nachrichtenController.renderUngeleseneNachrichtenCounter();

                    }

                });

                nachrichtDom.find("p").prepend(lieferanten);
                nachrichtDom.find(".deleteMessageButton").click(function () {
                    nachrichtenController.loescheEmpfangeneNachricht(nachricht);
                })

                nachrichtDom.collapsible();

                container.append(nachrichtDom)
            }
            append(nachricht)

        }

        nachrichtenController.renderUngeleseneNachrichtenCounter();


        //Reopen Collapsibles
        for (var j = 0; j < openedCollapsibles.length; j++) {
            $("#" + openedCollapsibles[j]).collapsible("expand");
        }

    },
    renderUngeleseneNachrichtenCounter: function () {
        if (nachrichtenController.ungeleseneNachrichten > 0) {
            $("#recievedNewLieferantenMessage").html("Empfangen (" + nachrichtenController.ungeleseneNachrichten + ")");
            $("#nachrichtenTab").html("Nachrichten (" + nachrichtenController.ungeleseneNachrichten + ")");
        }
        else {
            $("#recievedNewLieferantenMessage").html("Empfangen")
            $("#nachrichtenTab").html("Nachrichten");
        }
    }, renderGesendeteNachrichten: function () {

        var container = $("#sentMessageContainer");

        //Save opened Collapsibles
        var openedCollapsiblesDom = $("#sentMessageContainer .ui-collapsible:not(.ui-collapsible-collapsed)");
        var openedCollapsibles = [];
        for (var j = 0; j < openedCollapsiblesDom.length; j++) {
            openedCollapsibles.push(openedCollapsiblesDom[j].id)
        }


        container.html("");
        for (var i = 0; i < Math.min(nachrichtenController.nachrichtenSent.length, nachrichtenTab.showMax); i++) {
            var nachricht = nachrichtenController.nachrichtenSent[i];


            var lieferanten = $("<span>An:</span>");

            var countGelesen = 0;
            for (var j = 0; j < nachricht.lieferanten.length; j++) {

                var lieferant = lieferantenController.getLieferantByID(nachricht.lieferanten[j].lieferantid);

                if (lieferant) {
                    var lieferantDom = $("<a title ='" + lieferantenController.getLieferantFullName(lieferant) + "' class='lieferantMsgButton ui-btn ui-btn-inline ui-mini' >" + lieferant.name + "</a> ");

                    var clickLieferant = function (lieferantDom, lieferant) {
                        lieferantDom.click(function (event) {
                            event.stopPropagation();

                            lieferantenController.aktuellerLieferant = $.extend(true, {}, lieferant);
                            tabsController.openTabWithoutClick(3);
                            lieferantenController.zeigeAktuellenLieferanten();
                        })
                    }
                    clickLieferant(lieferantDom, lieferant);

                    if (nachricht.lieferanten[j].read) {
                        countGelesen++;
                        lieferantDom.attr('title', lieferantDom.attr('title') + " - Gelesen");

                    } else {
                        lieferantDom.addClass("lightgreenbutton")
                        lieferantDom.attr('title', lieferantDom.attr('title') + " - Ungelesen");
                    }

                }
                else {
                    countGelesen++;
                    lieferantDom = "<a class='lieferantMsgButton ui-btn ui-btn-inline ui-mini ui-disabled' >Unbekannt</a>";

                }

                lieferanten.append(lieferantDom)


            }
            lieferanten.append("<br/><br />");


            if (countGelesen == nachricht.lieferanten.length)
                var read = "read";
            else
                read = "unread";

            var append = function (nachricht) {

                var nachrichtDom = $('<div id="msgsent' + nachricht.id + '" data-role="collapsible" data-content-theme="false" data-collapsed-icon="carat-d" data-expanded-icon="carat-u" data-iconpos="right">' +
                    '<h4 class="' + read + '">' + misc.formatDate(new Date(nachricht.datum)) + "&nbsp&nbsp&nbsp&nbsp&nbsp" + nachricht.nachricht.replace(/<br \/>/g, " ") + '</h4>' +
                    '<p class="' + read + '">' + nachricht.nachricht +
                    '<a class="deleteMessageButton redbutton ui-btn ui-input-btn ui-btn-b ui-corner-all ui-shadow ui-btn-inline ui-mini ui-icon-delete ui-btn-icon-left">Löschen</a>' +
                    '</p>' +
                    '</div>')


                nachrichtDom.find("p").prepend($(lieferanten));

                nachrichtDom.find(".deleteMessageButton").click(function () {
                    nachrichtenController.loescheGesendeteNachricht(nachricht);
                })

                nachrichtDom.collapsible();

                container.append(nachrichtDom)
            }
            append(nachricht)
        }

        //Reopen Collapsibles
        for (var j = 0; j < openedCollapsibles.length; j++) {
            $("#" + openedCollapsibles[j]).collapsible("expand");
        }


    },
    sendeNachricht: function () {


        var lieferanten = nachrichtenTab.searchWidget.getSelectedItems();
        var lieferantenIds = [];

        for (var i = 0; i < lieferanten.length; i++) {
            lieferantenIds.push({lieferantid: lieferanten[i].id, read: false});
        }
        var nachrichtText = CKEDITOR.instances.messageLieferantenCKEditor.getData();

        if (lieferantenIds.length > 0 && nachrichtText.trim() != "") {

            var maerkte = termineTab.termineMarktSelectionWidget.getSelectedItems();
            var maerkteIds = [];

            for (var j = 0; j < maerkte.length; j++) {
                maerkteIds.push(maerkte[j].id);
            }
            var nachricht = {id: misc.getUniqueID(), lieferanten: lieferantenIds, read: false, datum: (new Date()).getTime(), nachricht: nachrichtText, maerkte: maerkteIds };

            console.dir(nachricht);


            nachrichtenController.nachrichtenSent.unshift(nachricht);
            this.renderGesendeteNachrichten();

            serverController.nachricht.create(nachricht);

            //Clear Data
            CKEDITOR.instances.messageLieferantenCKEditor.setData("");
            nachrichtenTab.searchWidget.setSelectedItems([]);
            nachrichtenTab.searchWidget.getInput().val("");
            nachrichtenTab.renderSelectedLieferanten();
            uiController.toast("Die Nachricht wurde versendet...", 1700);


        }


    },
    loescheEmpfangeneNachricht: function (nachricht) {

        serverController.antwortNachricht.delete(nachricht);

        nachrichtenController.nachrichtenRecieved = nachrichtenController.nachrichtenRecieved.filter(function (el) {
            return el.id !== nachricht.id;
        });

        $("#msgrec" + nachricht.id).remove();

    },
    loescheGesendeteNachricht: function (nachricht) {

        serverController.nachricht.delete(nachricht);

        nachrichtenController.nachrichtenSent = nachrichtenController.nachrichtenSent.filter(function (el) {
            return el.id !== nachricht.id;
        });

        $("#msgsent" + nachricht.id).remove();

    },
    showMoreRecieved: function () {
        serverController.antwortNachricht.getAll(nachrichtenController.handleAntwortNachrichtenFromServer, nachrichtenTab.showMax, nachrichtenTab.showMax + nachrichtenTab.showStep);
        nachrichtenTab.showMax = nachrichtenTab.showMax + nachrichtenTab.showStep;
    },
    showMoreSent: function () {
        serverController.nachricht.getAll(nachrichtenController.handleNachrichtenFromServer, nachrichtenTab.showMax, nachrichtenTab.showMax + nachrichtenTab.showStep);
        nachrichtenTab.showMax = nachrichtenTab.showMax + nachrichtenTab.showStep;

    }
}