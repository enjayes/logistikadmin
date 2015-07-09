/**
 * index.js.
 *
 *
 *
 *
 * @date 19.11.14 - 17:10
 *
 */




//Init Controllers
tabsController.init();

var initializedAfterFirstServerConnection = false;
var initAfterServerConnection = function () {

    if (!initializedAfterFirstServerConnection) {
        initializedAfterFirstServerConnection = true;
        uebersichtController.init();
        nachrichtenController.init();
        lieferantenController.init();
        termineController.init();
        jobsController.init();
        konfigurationsController.init();

        $(document).ready(function () {

            //Enable Routing
            setTimeout(function () {
                uiController.ready();
                Router.init();

            }, 0)

        });
    }


}

serverController.init(initAfterServerConnection);










