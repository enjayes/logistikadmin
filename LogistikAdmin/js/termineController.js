/**
 * termineController
 *
 *
 *
 *
 * @date 19.11.14 - 22:46
 *
 */



termineController = {
    init: function () {

        //Set Event Source
        this.calendarData.events = this.getCalendarEvents;
        this.calendarData.initialized = false;
    },
    ready: function () {


        serverController.termin.setUpdateCallblack(function () {

            termineTab.calender.removeNoRedraw = true;
            termineTab.calender.fullCalendar('removeEvents');
            termineTab.calender.fullCalendar('refetchEvents');

        })


    },
    events: [],
    calendarData: {
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        defaultDate: Date.now(),
        lang: "de",
        editable: true,
        eventLimit: true, // allow "more" link when too many events
        loading: function (loading) {


        },
        dayClick: function (date, jsEvent, view) {

            console.log(date);

            termineController.dontFadeEvents = true;
            termineController.erzeugeEvent(date);

            // alert('Clicked on: ' + date.format());
            // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            // alert('Current view: ' + view.name);
            // change the day's background color just for fun
            //$(this).css('background-color', 'red');

        }, eventClick: function (calEvent, jsEvent, view) {

            console.log("eventClickeventClickeventClickeventClick")

            termineController.zeigeEvent(calEvent, false);

            //alert('Event: ' + calEvent.title);
            //alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            //alert('View: ' + view.name);

            // change the border color just for fun
            //$(this).css('border-color', 'red');

        },
        eventDragStop:function(){
            console.log("eventDragStop")
            setTimeout(function(){
                //termineTab.calender.fullCalendar('removeEvents');
                termineTab.calender.fullCalendar('refetchEvents');
            },0)
        }

        ,eventDrop: function (event, delta, revertFunc) {
            console.log("eventDrop")
            termineController.dontFadeEvents = true;
            termineTab.calender.removeNoRedraw = true;


            if (event.repeatStart)
                if (event.start.toDate().getTime() < event.repeatStart.toDate().getTime())
                    event.repeatStart = event.start;

            serverController.termin.update(event);
        },

        eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
            termineController.dontFadeEvents = true;
            serverController.termin.update(event);

        },
        events: [],
        timeFormat: 'H(:mm)'

    },
    handleNewTermineFromServer: function (termine, callback) {

        if (termine) {

            var showMaerkte = termineTab.termineMarktSelectionWidget.getSelectedItems();

            termine = termine.filter(function (termin) {

                for (var i = 0; i < showMaerkte.length; ++i) {
                    if (termin.marktId == showMaerkte[i].id)
                        return true;
                }
                return false;
            })

            termineController.events = termine;

            if (termineTab.calender) {

                if (tabsController.tab() == termineTab) {

                    if (termineController.aktuellesEvent) {
                        var termin = termineController.getTerminByID(termineController.aktuellesEvent.id);

                        if (!termin)
                            $("#popupTermin").popup("close");
                        else if (termineController.aktuellerTerminGespeichert) {
                            termineController.zeigeEvent(termin, termineController.aktuellesEventIstNeu);
                        }

                    }
                }

                if (callback)
                    callback();


            }

        }
    },
    getCalendarEvents: function (start, end, timezone, callback) {



        serverController.termin.getRange(start, end, function (termine) {
            termineController.handleNewTermineFromServer(termine, function () {

                if (!termineController.dontFadeEvents) {

                    /*
                    $(".fc-widget-content").addClass("fade");
                    setTimeout(function () {
                        $(".fc-widget-content").removeClass("fade");
                    }, 300);
                     */
                }
                else
                    termineController.dontFadeEvents = false;


                //Create Colors for events
                for (var i = 0; i < termineController.events.length; ++i) {

                    var farbeLieferant = null
                    if (termineController.events[i].lieferant){

                        var farbeLieferant = lieferantenController.getLieferantByID(termineController.events[i].lieferant);
                        if(farbeLieferant){
                            var str =  farbeLieferant.farbe||misc.getColorFromUniqueID(farbeLieferant.id);
                            var str2  =  misc.invertRGB(str);
                        }


                    }


                    if(!farbeLieferant){
                        var colorId = termineController.events[i].id;
                        str = "aaaaaa";
                        str2 = misc.getColorFromUniqueID(colorId);
                    }


                    termineController.events[i].color = "#" + str;

                    termineController.events[i].textColor = "#" + str2 ;

                    if(termineController.events[i].start.toDate().getTime() < (new Date()).getTime())
                        if(!termineController.events[i].jobId||termineController.events[i].jobId=="")
                            termineController.events[i].borderColor = "#F00";


                    if (termineController.events[i].jobId)
                        termineController.events[i].title = "✔ " + termineController.events[i].title;
                    else if (termineController.events[i].alarm == 1)
                        termineController.events[i].title = "✘ " + termineController.events[i].title;


                }


                callback(termineController.events);

            })
        });


    },

    waehleLieferant: function (lieferant) {
        termineController.aktuellerTerminLieferant = lieferant;
        termineTab.searchWidget.setInputText(lieferantenController.getLieferantFullName(lieferant));
    },

    erzeugeEvent: function (date, lieferant) {
        if (lieferant)
            var lieferantid = lieferant.id;
        else
            lieferantid = null;

        var event = CalenderEventFactory.create(misc.titleUnbenannt, date, lieferantid);

        termineController.zeigeEvent(event, true);
    },
    aktuellesEvent: null,
    aktuellesEventIstNeu: false,
    aktuellerTerminGespeichert: true,

    zeigeEvent: function (calenderEvent, neuesEvent) {

        termineTab.searchWidget.getInput().off("input");
        $('#popupTermin .clockpicker input').off("change");
        $("#popupTermin input,#popupTermin textarea").off("input change");

        termineController.aktuellesEvent = $.extend({}, calenderEvent);
        termineController.aktuellesEventIstNeu = neuesEvent;

        var date = termineController.aktuellesEvent.start.format('DD.MM.YYYY');
        var time = termineController.aktuellesEvent.start.format('HH:mm');


        //Setze werte in Popup
        $("#eventDate").val(date).trigger("change");
        $(".input-group.clockpicker input").val(time);

        if (neuesEvent) {
            $("#popupTermin .bottombuttons, #loescheaktuelleseventbutton").addClass("newevent");
            $("#terminheader").text("Neuer Termin");

        }
        else {
            $("#popupTermin .bottombuttons, #loescheaktuelleseventbutton").removeClass("newevent");
            $("#terminheader").text("Termin");

        }

        $("#termintitel").val(calenderEvent.title.replace("✔ ", "").replace("✘ ", ""));

        if (termineController.aktuellesEvent.jobId) {
            $("#zeigeauftragvonterminbutton").removeClass("ui-disabled");
            $("#lieferantRepeatTerminParent").hide();
        }
        else {
            $("#zeigeauftragvonterminbutton").addClass("ui-disabled");
            $("#lieferantRepeatTerminParent").show();
        }

        termineTab.terminMarktSelectionWidget.selectedSingleItem(termineController.aktuellesEvent.marktId || uebersichtController.defaultMarktId);

        $("#terminnotizen").val(calenderEvent.notizen);

        if (tabsController.tab() == termineTab)
            var lieferantenInput = termineTab.searchWidget.getInput();
        else
            lieferantenInput = $("#lieferantenTerminReadyOnly");


        termineTab.searchWidget.selectedItems = [];

        if (calenderEvent.lieferant && calenderEvent.lieferant.trim() != "") {
            var lieferant = lieferantenController.getLieferantByID(calenderEvent.lieferant);

            if (lieferant && lieferant.id) {
                termineController.aktuellerTerminLieferant = lieferant;
                $("#lieferantAnzeigen button").removeClass("ui-disabled")
                lieferantenInput.val(lieferantenController.getLieferantFullName(lieferant));

                termineTab.searchWidget.selectedItems.push(lieferant);

            }
            else {
                $("#lieferantAnzeigen button").addClass("ui-disabled")
                lieferantenInput.val("");
            }

        } else {
            $("#lieferantAnzeigen button").addClass("ui-disabled")
            lieferantenInput.val("");
        }

        termineTab.searchWidget.renderList();

        if (calenderEvent.allDay) {
            $("#lieferantAlldayTermin").prop("checked", true).checkboxradio("refresh");
            $("#popupTermin .clockpicker").addClass("ui-disabled");
        }
        else {
            $("#lieferantAlldayTermin").removeProp("checked", true).checkboxradio("refresh");
            $("#popupTermin .clockpicker").removeClass("ui-disabled");
        }

        $("#popupTermin .ui-checkbox.lieferantAlldayTerminparent").click(function () {
            setTimeout(function () {
                if ($("#lieferantAlldayTermin").prop("checked"))
                    $("#popupTermin .clockpicker").addClass("ui-disabled");
                else
                    $("#popupTermin .clockpicker").removeClass("ui-disabled");
                if (termineController.aktuellerTerminGespeichert) {
                    termineController.aktuellerTerminGespeichert = false;
                    termineController.zeigeSpeicherButton()
                }
            }, 0)
        });


        if (termineController.aktuellesEvent.repeatStart)
            $("#eventDateStart").val(termineController.aktuellesEvent.repeatStart.format('DD.MM.YYYY'));
        else
            $("#eventDateStart").val(termineController.aktuellesEvent.start.format('DD.MM.YYYY'));

        if (calenderEvent.repeatDays > 0) {
            $("#lieferantRepeatTermin").prop("checked", true).checkboxradio("refresh");
            $("#repeatDaysText, #lieferantRepeatTerminInput").val(termineController.aktuellesEvent.repeatDays);
            $("#repeatDaysText, #lieferantRepeatTerminParent .ui-input-text").show();
            $("#lieferantRepeatTerminParent label").text("Wiederholen alle");
        }
        else {
            $("#lieferantRepeatTermin").removeProp("checked", true).checkboxradio("refresh");
            $("#repeatDaysText, #lieferantRepeatTerminParent .ui-input-text").hide();
            $("#lieferantRepeatTerminParent label").text("Wiederholen");
        }

        $("#popupTermin #lieferantRepeatTerminParent label").click(function () {
            setTimeout(function () {

                if ($("#lieferantRepeatTermin").prop("checked")) {
                    $("#repeatDaysText, #lieferantRepeatTerminInput").val(termineController.aktuellesEvent.repeatDays);
                    $("#repeatDaysText, #lieferantRepeatTerminParent .ui-input-text").show();
                    $("#lieferantRepeatTerminParent label").text("Wiederholen alle");
                }
                else {
                    $("#repeatDaysText, #lieferantRepeatTerminParent .ui-input-text").hide();
                    $("#lieferantRepeatTerminParent label").text("Wiederholen");
                }

                if (termineController.aktuellerTerminGespeichert) {
                    termineController.aktuellerTerminGespeichert = false;
                    termineController.zeigeSpeicherButton()
                }

            }, 0)
        });

        if (!tabsController.terminePopupOpen) {
            $("#popupTermin .redborder").removeClass("redborder");
            termineController.aktuellerTerminGespeichert = !neuesEvent;
            termineController.zeigeSpeicherButton();
            $("#popupTermin").popup("open", {
                transition: "pop"
            });
        }


        $("#popupTermin input,#popupTermin textarea").on("input change", function () {
            if (tabsController.terminePopupOpen)
                if (termineController.aktuellerTerminGespeichert) {
                    termineController.aktuellerTerminGespeichert = false;
                    termineController.zeigeSpeicherButton()
                }
        });

        //Validate Lieferant in Popup
        var checkValidLieferant = function () {

            if (tabsController.tab() == termineTab && tabsController.terminePopupOpen) {

                var lieferantenName = termineTab.searchWidget.getInput().val();

                var lieferant = lieferantenController.getLieferantByName(lieferantenName);
                if (lieferant && lieferant.id) {
                    termineController.aktuellerTerminLieferant = lieferant;
                    $("#lieferantAnzeigen button").removeClass("ui-disabled");
                }
                else {
                    termineController.aktuellerTerminLieferant = null;
                    $("#lieferantAnzeigen button").addClass("ui-disabled");
                }
            }
            if (termineController.aktuellerTerminGespeichert) {
                termineController.aktuellerTerminGespeichert = false;
                termineController.zeigeSpeicherButton()
            }
        }
        termineTab.searchWidget.getDomList().click(function () {
            setTimeout(checkValidLieferant(), 0)
        })


        termineTab.searchWidget.getInput().on("input", checkValidLieferant);

        //Check if time is right
        $('#popupTermin .clockpicker input').on("change", function () {
            var value = (($(this).val() || '') + '').split(':');
            var hours = parseInt(value[0]) || 0;
            var minutes = parseInt(value[1]) || 0;
            if (("" + hours).length == 1)
                hours = "0" + hours;
            if (("" + minutes).length == 1)
                minutes = "0" + minutes;
            $(this).val(hours + ":" + minutes)
        });


    },

    abbrechenBearbeitungAktuellesEvent: function () {
        Router.popupClosed = true;

        termineController.aktuellerTerminGespeichert = true;
        termineController.aktuellesEvent = null;
        termineController.aktuellerTerminLieferant = null;
        $("#popupTermin").popup("close");

    },


    speichereAktuellesEvent: function () {
        Router.popupClosed = true;

        var validated = true;
        $("#popupTermin .redborder").removeClass("redborder");

        //Validieren

        //Titel
        if ($("#termintitel").val().trim() == "") {
            validated = false;
            $("#termintitel").parent(".ui-input-text").addClass("redborder");
        }

        //Lieferanten Name validieren


        if ((!(tabsController.tab() == termineTab && termineTab.searchWidget.getInput().val().trim() == "")) && (!termineController.aktuellerTerminLieferant || !termineController.aktuellerTerminLieferant.id)) {
            validated = false;
            termineTab.searchWidget.getInput().parent(".ui-input-search").addClass("redborder");
        }


        var start = termineTab.calenderFactory.moment($("#eventDate").datepicker('getDate'));
        //console.log($("#eventDate").datepicker('getDate')+"   "+start+"  "+start.format('DD.MM.YYYY'))
        if (start.format('DD.MM.YYYY') != $("#eventDate").val().trim()) {
            validated = false;
            $("#eventDate").parent(".ui-input-text").addClass("redborder");
        }


        if ($("#lieferantRepeatTermin").prop("checked"))
            var repeatDays = parseInt($("#repeatDaysText, #lieferantRepeatTerminInput").val());
        else
            repeatDays = 0;

        var repeatStart = undefined;
        if (repeatDays > 0) {
            repeatStart = termineTab.calenderFactory.moment($("#eventDateStart").datepicker('getDate'));
            //console.log($("#eventDate").datepicker('getDate')+"   "+start+"  "+start.format('DD.MM.YYYY'))
            if (repeatStart.format('DD.MM.YYYY') != $("#eventDateStart").val().trim()) {
                validated = false;
                $("#eventDateStart").parent(".ui-input-text").addClass("redborder");
            }
        }


        var markt = termineTab.terminMarktSelectionWidget.getSelectedItems();
        if (markt.length != 1) {
            validated = false;
            $("#terminMarktSelection.ui-controlgroup-controls").addClass("redborder");
        }

        //Alle Daten in Ordnung
        if (validated) {
            termineController.aktuellerTerminGespeichert = true;

            //Eintragen
            termineController.aktuellesEvent.title = $("#termintitel").val();

            if (termineController.aktuellesEvent.jobId)
                termineController.aktuellesEvent.title = "✔ " + termineController.aktuellesEvent.title;
            else if (termineController.aktuellesEvent.alarm == 1)
                termineController.aktuellesEvent.title = "✘ " + termineController.aktuellesEvent.title;


            termineController.aktuellesEvent.marktId = markt[0].id;

            termineController.aktuellesEvent.notizen = $("#terminnotizen").val();

            termineController.aktuellesEvent.allDay = $("#lieferantAlldayTermin").prop("checked");

            termineController.aktuellesEvent.repeatDays = repeatDays;

            if (termineController.aktuellesEvent.repeatDays < 0)
                termineController.aktuellesEvent.repeatDays = 0;


            if (termineController.aktuellesEvent.allDay) {
                start.stripTime();
                termineController.aktuellesEvent.end = null;
            } else {
                var starttime = $('#popupTermin .clockpicker input').val();
                start.time(starttime + ":00");

                if (termineController.aktuellesEvent.end) {
                    var oldStart = termineTab.calenderFactory.moment(termineController.aktuellesEvent.start);
                    var oldEnd = termineTab.calenderFactory.moment(termineController.aktuellesEvent.end);
                    var duration = moment.duration(oldEnd.diff(oldStart));

                    if (duration) {
                        termineController.aktuellesEvent.end = termineTab.calenderFactory.moment(start).add(duration);
                    }


                }


            }
            termineController.aktuellesEvent.start = start;

            if (!termineController.aktuellerTerminLieferant || !termineController.aktuellerTerminLieferant.id) {
                if (termineController.aktuellesEvent.lieferant)
                    delete termineController.aktuellesEvent.lieferant
            }
            else
                termineController.aktuellesEvent.lieferant = termineController.aktuellerTerminLieferant.id;

            console.log("repeatStart")

            console.log(termineController.aktuellesEvent.repeatStart)

            if (repeatStart)
                termineController.aktuellesEvent.repeatStart = repeatStart;
            else
                termineController.aktuellesEvent.repeatStart = start;


            console.log(termineController.aktuellesEvent.repeatStart)

            if (this.aktuellesEventIstNeu)
                serverController.termin.create(termineController.aktuellesEvent);
            else
                serverController.termin.update(termineController.aktuellesEvent);

            termineController.aktuellesEvent = null;
            termineController.aktuellerTerminLieferant = null;
            $("#popupTermin").popup("close");
        }

    },
    zeigeSpeicherButton: function () {

        $("#abbrechenbearbeitungaktuelleseventbutton").css("opacity", 0).removeClass("fade");
        $("#abbrechenbearbeitungaktuelleseventbuttonn").show();
        $("#speichereaktuelleseventbutton").hide().removeClass("fade");


        if (termineController.aktuellerTerminGespeichert) {
            $("#popupTermin .bottombuttons").addClass("saved");
            $("#abbrechenbearbeitungaktuelleseventbutton").text("Ok").removeClass("ui-icon-delete").addClass("ui-icon-check");
            setTimeout(function () {
                $("#abbrechenbearbeitungaktuelleseventbutton").addClass("fade");
            }, 0)
        } else {
            $("#popupTermin .bottombuttons").removeClass("saved");


            $("#abbrechenbearbeitungaktuelleseventbutton").text("Abbrechen").removeClass("ui-icon-check").addClass("ui-icon-delete");

            setTimeout(function () {
                $("#abbrechenbearbeitungaktuelleseventbutton").addClass("fade");
                $("#speichereaktuelleseventbutton").addClass("fade");
                $("#speichereaktuelleseventbutton").show();
            }, 0)

        }


    }, loescheAktuellenTermin: function () {
        $("#popupTermin").popup("close");
        setTimeout(function () {
            $("#deleteTerminPopup").popup("open", {
                transition: "pop"
            });
        }, 500)


    },
    deletePopupYes: function () {
        Router.popupClosed = true;


        termineController.events = termineController.events.filter(function (el) {
            return el.id !== termineController.aktuellesEvent.id;
        });


        termineController.calendarData.events = termineController.events;

        termineTab.calender.fullCalendar('removeEvents');
        termineTab.calender.fullCalendar('addEventSource', termineController.events);

        //Update Server DB
        serverController.termin.delete(termineController.aktuellesEvent);

        termineController.aktuellerTerminGespeichert = true;
        termineController.aktuellesEvent = null;
        termineController.aktuellerTerminLieferant = null;
        $("#deleteTerminPopup").popup("close");


    },
    deletePopupNo: function () {
        Router.popupClosed = true;
        termineController.aktuellerTerminGespeichert = true;
        termineController.aktuellesEvent = null;
        termineController.aktuellerTerminLieferant = null;
        $("#deleteTerminPopup").popup("close");


    }, oeffneLieferantenTab: function () {

        if (termineController.aktuellerTerminLieferant) {
            var url = location.protocol + "//" + location.host + "#state=tab_3+l_" + termineController.aktuellerTerminLieferant.id + "+jq_";
            var win = window.open(url, '_blank');
            win.focus();
        }

    },
    getTerminByID: function (termin_id) {

        for (var i = 0; i < termineController.events.length; i++) {
            if (termineController.events[i].id == termin_id) {
                return termineController.events[i];
            }

        }
        return null;

    },
    showJobInNewWindow: function (jobId) {
        var url = location.protocol + "//" + location.host + "#job=" + jobId;
        var win = window.open(url, '_blank');
        win.focus();
    },

    showJob: function (jobId) {

        uiController.showLieferschein = true;
        $("#tabs .ui-tabs-panel").hide();
        $("#tabs .ui-navbar").css("pointer-events", "none");
        $("#mainbackground").css("top", "94px");
        $("#besucherschein").show();

        $("#tabs").css("opacity", "0");

        $("#page").addClass("besucherschein");
        serverController.job.get(jobId, function (job) {

            var errorLoading = "Dieser Besucherschein wurde entfernt...";
            if (!job || !job.lieferanten_id)
                $("#besucherscheinMeldung").html(errorLoading).show();
            else {
                console.log(job.lieferanten_id)

                console.dir(lieferantenController.lieferanten)

                var showJob = function () {
                    //Lieferanten not loadedyet
                    if (!lieferantenController.loaded)
                        setTimeout(function () {
                            showJob(jobId)
                        }, 100);
                    else {

                        var lieferant = lieferantenController.getLieferantByID(job.lieferanten_id);

                        if (!lieferant)
                            $("#besucherscheinMeldung").html(errorLoading).show();
                        else {

                            $("#besucherscheinMarkt").html(job.markt_id);
                            $("#besucherscheinFirma").html(lieferant.firma);

                            $("#besucherscheinLieferant").html(lieferantenController.getLieferantFullName(lieferant));

                            $("#besucherscheinDatum").html(termineTab.calenderFactory.moment(job.timestamp_start).format('LL'));

                            $("#besucherscheinUhrzeit").html(termineTab.calenderFactory.moment(job.timestamp_start).format('hh:mm'));

                            $("#besucherscheinThematik").html(window.atob(job.t_thematik));
                            $("#besucherscheinZiel").html(window.atob(job.t_ziel));
                            $("#besucherscheinGrund").html(window.atob(job.t_grund));
                            $("#besucherscheinGespraechspartner").html(window.atob(job.gespraechspartner));

                            job.cb_auftrag_getaetigt ? $("#besucherscheinAuftraggetaetigt").html("X") : {};
                            job.cb_aktionsabsprache ? $("#besucherscheinAktionsabsprache").html("X") : {};
                            job.cb_bemusterung ? $("#besucherscheinBemusterung").html("X") : {};
                            job.cb_info_gespraech ? $("#besucherscheinInfoGespraech").html("X") : {};
                            job.cb_mhd ? $("#besucherscheinMHD").html("X") : {};
                            job.cb_nr_abgabe ? $("#besucherscheinNrAbgabe").html("X") : {};
                            job.cb_reklamation ? $("#besucherscheinRelamationsbearbeitung").html("X") : {};
                            job.cb_ruecknahme ? $("#besucherscheinRuecknahme").html("X") : {};
                            job.cb_sortimentsinfo ? $("#besucherscheinSortimentsinfo").html("X") : {};
                            job.cb_umbau ? $("#besucherscheinUmbau").html("X") : {};
                            job.cb_verkostung ? $("#besucherscheinVerkostung").html("X") : {};
                            job.cb_verlosung ? $("#besucherscheinVerlosung").html("X") : {};
                            job.cb_warenaufbau ? $("#besucherscheinWarenaufbau").html("X") : {};

                            $("#besucherscheinVKBetrag").html(window.atob(job.t_vk_euro_abgabe + " €"));
                            $("#besucherscheinWarengruppe").html(window.atob(job.t_warengruppe));
                            $("#besucherscheinNotizen").html(window.atob(job.t_notizen));

                            $("#besucherscheinContent").show();

                        }
                    }
                };
                showJob();
            }

        })

    }


}


/*
 {
 title: 'All Day Event',
 start: '2014-11-01'
 },
 {
 title: 'Long Event',
 start: '2014-11-07',
 end: '2014-11-10'
 },
 {
 id: 999,
 title: 'Repeating Event',
 start: '2014-11-09T16:00:00'
 },
 {
 id: 999,
 title: 'Repeating Event',
 start: '2014-11-16T16:00:00'
 },
 {
 title: 'Conference',
 start: '2014-11-11',
 end: '2014-11-13'
 },
 {
 title: 'Meeting',
 start: '2014-11-12T10:30:00',
 end: '2014-11-12T12:30:00'
 },
 {
 title: 'Lunch',
 start: '2014-11-12T12:00:00'
 },
 {
 title: 'Meeting',
 start: '2014-11-12T14:30:00'
 },
 {
 title: 'Happy Hour',
 start: '2014-11-12T17:30:00'
 },
 {
 title: 'Dinner',
 start: '2014-11-12T20:00:00'
 },
 {
 title: 'Birthday Party',
 start: '2014-11-13T07:00:00'
 },
 {
 title: 'Click for Google',
 start: '2014-11-28'
 }*/