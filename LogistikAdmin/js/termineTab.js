/**
 * termineTab
 *
 *
 *
 *
 * @date 19.11.14 - 21:58
 *
 */



termineTab = {
    anchorName:"termineTab",
    controller: termineController,
    calender: null,
    calenderFactory: null,
    allowOpening: false,
    searchWidget:null,
    termineMarktSelectionWidget:null,
    terminMarktSelectionWidget:null,

    init: function () {


        this.searchWidget = new SearchWidget("#searchTerminLieferanten", "Suche nach Lieferanten...", 4, false, function (lieferant) {
                termineController.waehleLieferant(lieferant);
            }, function (lieferant, classes) {
                return "<li class='" + classes + "'><a>" + lieferantenController.getLieferantFullName(lieferant) + "</a></li>";
            }, function (visible,top,height) {
                $("#pagecontent").css("min-height", visible?top+height:"");
            }
        )


        this.termineMarktSelectionWidget = new MultipleSelectionWidget("#termineMarktSelection",false,function(){
            termineTab.calender.removeNoRedraw = true;
            termineController.dontFadeEvents = true;
            termineTab.calender.fullCalendar('removeEvents');
            termineTab.calender.fullCalendar('refetchEvents');
        });

        this.terminMarktSelectionWidget = new MultipleSelectionWidget("#terminMarktSelection",true,function(){

        });


    },

    ready: function () {

        $('#popupTermin .clockpicker').clockpicker();

        //Termine Popup Style Widgets
        $("#popupTermin").on("popupafteropen", function (event, ui) {
            uiController.updateSize();
            $("#termintitel").select();

        });
        $("#popupTermin").on("popupbeforeposition", function (event, ui) {
            tabsController.terminePopupOpen = true;


            if (tabsController.tab() == termineTab) {
                $("#lieferantenTerminReadyOnly").parent(".ui-input-text").hide();
                $("#lieferantAnzeigen button").show();
                $("#searchTerminLieferanten").show();

            } else {
                $("#lieferantenTerminReadyOnly").parent(".ui-input-text").show();
                $("#lieferantAnzeigen button").hide();
                $("#searchTerminLieferanten").hide();
            }
        });

        $("#popupTermin").on("popupafterclose", function (event, ui) {
            tabsController.terminePopupOpen = false;
            $("#speichereaktuelleseventbutton, #abbrechenbearbeitungaktuelleseventbutton, #loescheaktuelleseventbutton").removeClass("fade");

        });


        setTimeout(function () {


            termineTab.calender = $('#calendar');
            termineTab.calender.fullCalendar(termineController.calendarData);
            termineTab.calenderFactory = termineTab.calender.fullCalendar("getCalendar");

            delete termineController.calendarData.events;



          $("#calendar .fc-today-button").addClass("fc-state-disabled").attr("disabled","disabled");
        }, 0);

    },
    open: function () {

        termineTab.calender.fullCalendar('render');
        termineTab.calender.find('.fc-toolbar').show();
        termineTab.calender.fullCalendar( 'rerenderEvents' )

    }


}