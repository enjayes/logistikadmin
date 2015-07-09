/**
 * tabsController
 *
 *
 *
 *
 * @date 19.11.14 - 22:03
 *
 */


tabsController = {
    aktuellerTab: null,
    tabs: [],
    //Init Controller
    init: function () {
        this.tabs[0] = uebersichtTab;
        this.tabs[1] = termineTab;
        this.tabs[2] = nachrichtenTab;
        this.tabs[3] = lieferantenTab;
        this.tabs[4] = konfigurationsTab;

        //Init Tabs
        for (var i = 0; i < tabsController.tabs.length ; i++) {
            this.tabs[i].init();
        }

        //Save Action
        $( "#tabs" ).on( "tabsbeforeactivate", function( event, ui ) {


            if(tabsController.tab()==lieferantenTab&&!lieferantenController.aktuellerLieferantGespeichert){

                console.dir(event)
                setTimeout(function(){
                    lieferantenController.checkSaved(function(){
                        lieferantenController.zeigeAktuellenLieferanten();
                        setTimeout(function(){
                            console.dir(ui.newTab)
                            $(ui.newTab.context).click();
                        },500)

                    })
                },0)

                return false;

            }else
                tabsController.openTab(tabsController.openTabAttempt)

        } );





    },
    tab: function () {
        return this.tabs[this.aktuellerTab];
    },
    //Init after UI Loaded
    ready: function () {
        //Init Tabs
        for (var i = 0; i < tabsController.tabs.length; i++) {
            tabsController.tabs[i].ready();
        }
        //Init Controllers
        setTimeout(function(){
            for (var i = 0; i < tabsController.tabs.length; i++) {
                if(tabsController.tabs[i].controller)
                 tabsController.tabs[i].controller.ready();
            }
        },0)


    },
    clickedTab:function(index){
     this.openTabAttempt =  index;
    }

    ,
    // Open Tab
    openTab: function (index) {

        if (index != this.aktuellerTab) {

            $(".tabinhalt").css("opacity", "0")

            setTimeout(function () {
                tabsController.aktuellerTab = index;


                $(".tabinhalt").addClass("animate");
                setTimeout(function () {   $(".tabinhalt").css("opacity","1").removeClass("animate");  }, 350)

                tabsController.tabs[index].open();

                uiController.updateSize();

                //Inhalt anzeigen nach Rendern
                //State Updaten
                  Router.pushState();

            }, 0)

        }

    },
    openTabWithoutClick:function(index){

        index= parseInt(index+"");
        if(index<0||index>tabsController.tabs.length-1)
         return;



        tabsController.openTabAttempt =  index;

        $("#tabs").tabs( "option", "active", tabsController.openTabAttempt );

        $("#maintabs .ui-btn-active").removeClass("ui-btn-active")


        $("#maintabs #"+tabsController.tabs[index].anchorName).addClass("ui-btn-active")



    }


}


