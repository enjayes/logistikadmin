/**
 * uebersichtController
 *
 *
 *
 *
 * @date 19.11.14 - 22:19
 *
 */

uebersichtController = {
    statistics: null,
    maerkte: null,
    defaultMarktId: null,
    auftragsHistorieDataTable: null,
    statistikUebersichtDataTable: null,
    warengruppen: ["Alle", "Metzgerei", "Obst und Gemüse", "Backwaren Bedienung", "Käseabteilung", "Fischabteilung", "Drogerie", "Molkereiprodukte", "Tiefkühlkost", "Getränkeabteilung", "SB-Wurst", "Tabakwaren", "Zeitschriften und Bücher"],
    warengruppe: "Alle",
    init: function () {

        $.extend($.fn.dataTableExt.oSort, {
            "datestring-pre": function (a) {
                var date = a.substring(12,16)+"."+a.substring(9,11)+"."+a.substring(7,9)+" "+a.substring(3,5)+"."+a.substring(0,2);
                return date;
            },
            "datestring-asc": function (a, b) {
                return ((a < b) ? -1 : ((a > b) ? 1 : 0));
            },
            "datestring-desc": function (a, b) {
                return ((a < b) ? 1 : ((a > b) ? -1 : 0));
            }
        });


        this.auftragsHistorieDataTable = $('#auftragsHistorie').DataTable({
            "data": [],
            "searching": false,

            "columns": [
                { "title": "Id" },
                { "title": "Lieferant" },
                { "title": "Markt" },
                { "title": "NR" },
                { "title": "Datum", "sType": "datestring" }

            ],
            "columnDefs": [
                {
                    "targets": [ 0 ],
                    "visible": false,
                    "searchable": false
                }
            ],
            "language": {
                "url": "js/German.json"
            },
            "createdRow": function (row, data, dataIndex) {
                $(row).css("cursor", "pointer").click(function () {
                    if (data[0]) {
                        termineController.showJobInNewWindow(data[0]);

                    }
                })
            }
        });


        this.statistikUebersichtDataTable = $('#statistikUebersicht').DataTable({
            "data": [],
            "searching": false,
            "columns": [
                { "title": "Id" },
                { "title": "Lieferant" },
                { "title": "Naturalrabatt" },
                { "title": "Datum" }

            ],
            "columnDefs": [
                {
                    "targets": [ 0 ],
                    "visible": false,
                    "searchable": false
                }
            ],
            "language": {
                "url": "js/German.json"
            },
            "createdRow": function (row, data, dataIndex) {
                $(row).css("cursor", "pointer").click(function () {
                    if (data[0]) {
                        termineController.showJobInNewWindow(data[0]);

                    }
                })
            }
        });

        serverController.markt.getAll(function (maerkte) {

            uebersichtController.maerkte = maerkte;
            uebersichtController.defaultMarktId = uebersichtController.maerkte[0].id;

            //TODO move to Controllers
            termineTab.termineMarktSelectionWidget.setData(uebersichtController.maerkte, null, true, false);
            termineTab.terminMarktSelectionWidget.setData(uebersichtController.maerkte, null, false, true);
            nachrichtenTab.nachrichtenMarktSelectionWidget.setData(uebersichtController.maerkte, null, true, true);
            uebersichtTab.auftragsHistorieMarktSelectionWidget.setData(uebersichtController.maerkte, null, true, false);

            konfigurationsController.setMaerkte(uebersichtController.maerkte);

        });


        serverController.statistics.get(function (statistics) {
            if (statistics) {
                uebersichtController.statistics = statistics;

                if (statistics.jobs == 0 || (statistics.besuche == 0 && statistics.bestellungen == 0 && statistics.verraeumungen == 0 && statistics.austausche == 0)) {


                } else {


                    var pieData = [
                        {
                            value: statistics.besuche,
                            label: "Besuche"
                        } ,
                        {
                            value: statistics.bestellungen,
                            label: "Bestellungen"
                        },
                        {
                            value: statistics.verraeumungen,
                            label: "Verräumungen"
                        },
                        {
                            value: statistics.austausche,
                            label: "Austausche"
                        }
                    ];

                    uebersichtTab.pieAufteilung.setData(pieData);

                }

            }

        });

        var auftragsHistorieWarengruppenSelection = $("#auftragsHistorieWarengruppenSelection");
        for (var i = 0; i < this.warengruppen.length; i++) {
            auftragsHistorieWarengruppenSelection.append('<div class="ui-checkbox ui-mini"><label id="auftragsHistorieWarengruppenSelection-radio-choice-' + i + '-label" for="auftragsHistorieWarengruppenSelection-radio-choice-' + i + '" class="ui-btn ui-corner-all ui-btn-inherit ui-first-child">' + this.warengruppen[i] + '</label><input type="checkbox" name="auftragsHistorieWarengruppenSelection-radio-choice-' + i + '" id="auftragsHistorieWarengruppenSelection-radio-choice-' + i + '" data-cacheval="false"></div>')

            if (i == 0)
                auftragsHistorieWarengruppenSelection.find('#auftragsHistorieWarengruppenSelection-radio-choice-' + i + '-label').addClass("ui-checkbox-on ui-btn-active");


            auftragsHistorieWarengruppenSelection.find('#auftragsHistorieWarengruppenSelection-radio-choice-' + i + '-label').click(function () {

                $(this).parent().parent().find(".ui-btn-active").removeClass("ui-checkbox-on ui-btn-active");
                $(this).addClass("ui-checkbox-on ui-btn-active");

                uebersichtController.warengruppe = $(this).text();

                uebersichtController.updateAuftragsHistorie();
            })

        }

        //auftragsHistorieWarengruppenSelection.controlgroup("refresh")
    },
    ready: function () {


    },
    updateAuftragsHistorie: function () {
        serverController.job.getAll(function (jobs) {

            var maerkteSelected = uebersichtTab.auftragsHistorieMarktSelectionWidget.getSelectedItems();
            var lieferantenSelected = uebersichtTab.searchWidget.getSelectedItems();

            uebersichtController.auftragsHistorieDataTable.clear();

            var shown = 0;

            //märkte statistiken
            var maerkte = [];

            for (var i = 0; i < jobs.length; i++) {
                var job = jobs[i];

                var lieferant = lieferantenController.getLieferantByID(job.lieferanten_id);

                if (lieferant) {
                    var selected = 0;
                    for (var j = 0; j < maerkteSelected.length; j++) {

                        if (job.markt_id == maerkteSelected[j].name) {
                            selected++;
                            break;
                        }
                    }
                    for (j = 0; j < lieferantenSelected.length; j++) {

                        if (lieferant.id == lieferantenSelected[j].id) {
                            selected++;
                            break;
                        }
                    }

                    if (uebersichtController.warengruppe == "Alle" || uebersichtController.warengruppe == job.warengruppe)
                        selected++;

                    if (selected == 3) {
                        uebersichtController.auftragsHistorieDataTable.row.add([job.id, lieferantenController.getLieferantFullName(lieferant), job.markt_id, job.t_vk_euro_abgabe, termineTab.calenderFactory.moment(job.timestamp_start).format('HH:mm DD.MM.YYYY')]);
                        shown = shown + 1;

                        //Sum over NR of last 12 month
                        if ((new Date().getTime()) - job.timestamp_start < 1000 * 60 * 60 * 24 * 365) { //Only within one year

                            var markt = null;
                            for (var j = 0; j < maerkte.length; j++) {
                                if (maerkte[j].id == job.markt_id)
                                    markt = maerkte[j];
                            }
                            if (!markt) {
                                markt = {id: job.markt_id, sum_t_vk_euro_abgabe: 0};
                                maerkte.push(markt);
                            }

                            markt.sum_t_vk_euro_abgabe = markt.sum_t_vk_euro_abgabe + job.t_vk_euro_abgabe

                        }

                    }

                }
            }


            if (shown == 0)
                $("#auftragsZusammenfassung").hide();
            else {

                var uebersichtSum = $("#auftragsZusammenfassung").html("<b>Letzte 12 Monate:</b><br><br>");

                for (var j = 0; j < maerkte.length; j++) {

                    uebersichtSum.append("<b>" + maerkte[j].id + ":</b><br>&nbsp;&nbsp;&nbsp;NR Summe: " + maerkte[j].sum_t_vk_euro_abgabe)

                    if (j < maerkte.length - 1)
                        uebersichtSum.append("<br><br>");
                }

                uebersichtSum.show();

            }

            uebersichtController.auftragsHistorieDataTable.rows().invalidate().draw();

        });

    },
    showJobs: function (lieferant) {
        uebersichtTab.searchWidget.setSelectedItems([lieferant]);
        uebersichtController.updateAuftragsHistorie();
        setTimeout(function () {

            uebersichtTab.openSubTab(0);
            tabsController.openTabWithoutClick(0);


        }, 0);
    }

}