/**
 * uiController
 *
 *
 *
 *
 * @date 19.11.14 - 22:11
 *
 */



uiController = {
    showLieferschein:false,
    ready: function () {


        window.onbeforeunload = function (event) {

            if (typeof event == 'undefined') {
                event = window.event;
            }

            if (event) {
                if (!lieferantenController.aktuellerLieferantGespeichert || !termineController.aktuellerTerminGespeichert) {

                    var message = 'Sie haben ihre Änderungen noch nicht gespeichert!';
                    event.returnValue = message;
                }
            }

            return message;
        }

        //Show job
        if(location.hash.slice(0,5).toLowerCase()=="#job="){
           termineController.showJob(location.hash.slice(5));
        }


        $("body").show();

        //Init Calender rendering
        $('#calendar .fc-toolbar').hide();


        //Stop Clicks
        $(".ui-tabs-panel .ui-input-btn").click(function (event) {
            event.stopPropagation();
        })

        //Buttons parents

        $("#eventDate").parent(".ui-input-text").addClass("eventDateparent");

        $("#lieferantAlldayTermin").parent(".ui-checkbox").addClass("lieferantAlldayTerminparent");


        //Window Resize Handling
        $(window).resize(uiController.updateSize);

        //Confirm Ready for Tabs and Corresponding Controllers
        tabsController.ready();

        //Confirm Ready for other Controllers
        jobsController.ready();


        //Rearange Widgets
        $("#popupTermin .eventDateparent").after($("#popupTermin .input-group.clockpicker"))

        $("#popupTermin .eventDateparent").append($("#popupTermin .input-group-addon").clone())

        //Execute resize actions
        uiController.updateSize();


    },
    updateSize: function () {
      var width = $("#tabs .ui-tabs-nav").width()+50;
      $("#mainbackground").css({
          width: width+4,
          left:($("body").width()-width)/2

      })

        $("#besucherschein").css({
            width: width+4,
            left:($("body").width()-width)/2

        })
        $("#infoProgrammer").css("bottom",-($(window).height()-415));

        $("body").css("height",$(window).height());

    },
    toast: function (msg, time, touchFunc) {
        $("#toastId").remove();
        var toastclass = 'ui-loader ui-overlay-shadow ui-bar-e ui-corner-all fadein';
        $("<div id='toastTest' 'class= '" + toastclass + "' style='white-space:nowrap'>" + msg + "</div>")
            .css({ display: "inline-block", visibility: "visisble"})
            .appendTo($.mobile.pageContainer)
        $("<div class='" + toastclass + "' id = 'toastId'>" + msg + "</div>")
            .css({


                display: "block",
                opacity: 0.8,
                position: "fixed",
                padding: "10px",
                "text-align": "center",
                "background-color": "rgba(1, 113, 23, 0.78)",
                color: "#fff",
                "font-weight": "bold",
                "text-shadow": "none",
                "-webkit-box-shadow": "1px 0 5px rgba(0, 0, 0, 0.65)",
                "-moz-box-shadow": "1px 0 5px rgba(0, 0, 0, 0.65)",
                "box-shadow": "1px 0 5px rgba(0, 0, 0, 0.65)",
                width: $("#toastTest").width() + 60,
                left: ($(window).width() - ($("#toastTest").width() + 60)) / 2,


                top: $(window).height() / 2 - $("#toastTest").height() / 2})
            .click(function () {
                $("#toastId").hide();
                touchFunc();
            })
            .appendTo($.mobile.pageContainer)
            .fadeTo(400, 0.8)
            .delay(time)
            .fadeOut(400, function () {
                $(this).remove();
            });
        $("#toastTest").remove();


    }
}