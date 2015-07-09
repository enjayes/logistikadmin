/**
 * searchWidget
 *
 *
 *
 *
 * @date 27.11.14 - 23:02
 *
 */


var SearchWidget = function (domObject, searchPlaceHolder, topMargin, multiSelect, clickedItemCallback, renderItemFunction, afterFilteredCallback) {

    if ($(domObject).length == 0) {
        console.log("ERROR, filterable not found...")
        return;
    }

    searchPlaceHolder = !searchPlaceHolder ? "" : searchPlaceHolder;
    topMargin = !topMargin && topMargin != 0 ? 55 : 36 + topMargin;

    var that = this;
    this.domObject = domObject;
    this.filterableDomObject = domObject + " .searchWidget-resultlist";
    this.searchPlaceHolder = searchPlaceHolder;
    this.origList = [];

    this.list = [];
    this.showAll = true;
    this.DontDismissByBlur = false;
    this.DontDismiss = false;
    this.clickedItemCallback = clickedItemCallback;

    this.selectedItems = [];
    this.multiSelect = multiSelect;

    $(this.domObject).css("position","relative");

    // Init Filterable
    $.mobile.document.one("filterablecreate", that.filterableDomObject, function () {

        $(that.filterableDomObject).filterable("option", "filterCallback", function (index, searchValue) {

            //Alle anzeigen
            if (that.showAll)
                return false;

            //Kein Term eingebenen
            if (searchValue.trim() == "")
                return false;

            //Gefunden
            return !($(this).text().toLowerCase().search(searchValue.toLowerCase()) != -1);

        });

    });
    //console.log(domObject+" "+)
    //Build Filterable
    $(that.domObject).append(
        '<form>' +
            '<input class="searchWidget-filterable" placeholder="' + that.searchPlaceHolder + '" data-type="search">' +
            ' </form>' +
            '<ul class="searchWidget-resultlist" style="z-index:1000!important;top:' + topMargin + 'px;" data-role="listview" data-inset="true" data-filter="true" data-input="' + that.domObject + ' .searchWidget-filterable"></ul>'

    );


    //Bind Events and Logic
    setTimeout(function () {

        //Zeige alle Lieferanten bei anklicken des Filters
        $(that.domObject + " input").on("focus",function () {
            $(that.filterableDomObject).show();
            if (afterFilteredCallback)
                afterFilteredCallback(true, $(that.filterableDomObject).offset().top, $(that.filterableDomObject).height());

            if (!that.showAll)
                that.toggleShowAllItems();


        }).on("keydown", function (e) {

                if (e.which == 13) {

                    var obj = $(that.filterableDomObject + " li").filter(":visible");
                    if (obj.length > 0)
                        $(obj[0]).click();
                    $(that.domObject + " input").blur();
                }
            });


        //Bei Eingabe alle anzeigen deaktivieren
        $(that.domObject + " input").on("input change",function () {

            if (that.showAll)
                that.toggleShowAllItems();

        }).click(function (event) {
                event.stopPropagation()
            });


        //Dismiss Selection bei Click elsewhere
        var dismissFilter = function () {

            if (!that.DontDismiss && !that.DontDismissByBlur) {
                that.DontDismiss = true;
                setTimeout(function () {
                    that.DontDismiss = false;
                }, 400);

                if (that.showAll)
                    that.toggleShowAllItems();
                else
                    $(that.filterableDomObject).filterable("refresh");

                $(that.filterableDomObject).hide();

                if (afterFilteredCallback)
                    afterFilteredCallback(false, $(that.filterableDomObject).offset().top, $(that.filterableDomObject).height());

            }

        };
        $("#page").click(function () {
            dismissFilter();
        });

        $(that.domObject + " .ui-input-clear").click(function (event) {
            event.stopPropagation()
            that.DontDismissByBlur = true;
        });

        $(that.domObject + " input").on("blur", function () {
            setTimeout(function () {

                dismissFilter();
            }, 300)
        });

        //Filterable Methods

        $(that.filterableDomObject).filterable({
            filter: function (event, ui) {

                //Show Items if show all and focus
                if ($(that.domObject + " input").is(":focus") && $(that.domObject + " input").val().trim() == "") {
                    $(that.filterableDomObject + " li").removeClass("ui-screen-hidden");

                }


                if (that.list.length == 0 || (!that.showAll && $(that.filterableDomObject + " li.ui-screen-hidden").length == $(that.filterableDomObject + " li").length)) {
                    $(that.filterableDomObject).hide();
                    if (afterFilteredCallback)
                        afterFilteredCallback(false, $(that.filterableDomObject).offset().top, $(that.filterableDomObject).height());

                } else if (that.showAll || $(that.domObject + " input").is(":focus")) {
                    $(that.filterableDomObject).show();

                    if (afterFilteredCallback)
                        afterFilteredCallback(true, $(that.filterableDomObject).offset().top, $(that.filterableDomObject).height());
                }


            }
        });


        //Render List
        that.renderList();

        //Trigger Filter at start
        $(that.domObject + " input").trigger("change");

    }, 0);


    this.toggleShowAllItems = function () {

        that.showAll = !that.showAll;
        if (that.showAll) {
            that.DontDismissByBlur = true;
            setTimeout(function () {
                that.DontDismissByBlur = false;
            }, 400);

        }


        $(that.filterableDomObject).filterable("refresh");

    };


    this.setList = function (list) {
        that.origList = $.extend(true, [], list);
        that.list = $.extend(true, [], list);
        if (that.multiSelect)
            that.list.unshift({name: "Alle", addAll: true});

        //Update Selected Elements
        //Remove from receipients list in nachrichten Tab
        var newSelectedLieferanten = [];
        var selectedLieferanten = that.getSelectedItems();
        that.list.forEach(function (actEl) {
            var lieferant = selectedLieferanten.filter(function (el) {
                return el.id == actEl.id;
            });

            if (lieferant.length > 0) {
                newSelectedLieferanten.push(actEl)
            }
        });
        that.setSelectedItems(newSelectedLieferanten);  //Also Renderes List
    };


    this.getInput = function () {
        return $(that.domObject + " input");
    };

    this.getDomList = function () {
        return $(that.filterableDomObject);
    };


    this.setInputText = function (text) {
        $(that.domObject + " input").val(text);
    };


    this.getSelectedItems = function () {
        return that.selectedItems;
    };

    this.setSelectedItems = function (selectedItems) {
        that.selectedItems = selectedItems;
        that.renderList();
        that.clickedItemCallback();
    };


    this.itemSelected = function (item) {

        for (var i = 0; i < that.selectedItems.length; i++) {   //CHANGE FOR DIFFERENT COMPARISIONS
            if (that.selectedItems[i].id == item.id) {
                return true;
            }
        }
        return false;
    };


    this.deselectedItem = function (item) {

        for (var i = 0; i < that.selectedItems.length; i++) {   //CHANGE FOR DIFFERENT COMPARISIONS
            if (that.selectedItems[i].id == item.id) {
                that.selectedItems.splice(i, 1)
                return true;
            }
        }
        return false;
    };

    this.renderList = function () {

        $(that.filterableDomObject).html("");

        if (that.list.length > 0) {

            for (var i = 0; i < that.list.length; i++) {
                var item = that.list[i];


                var callbackFactory = function (actItem) {
                    return function () {
                        if (actItem.addAll) {
                            if (that.selectedItems.length == that.origList.length) {

                                var oldSelectedItems = $.extend(true, [], that.selectedItems);
                                that.selectedItems = [];
                                for (var i = 0; i < oldSelectedItems.length; i++) {
                                    that.clickedItemCallback(oldSelectedItems[i]);
                                }

                            } else {
                                that.selectedItems = $.extend(true, [], that.origList)
                                for (i = 0; i < that.selectedItems.length; i++) {
                                    that.clickedItemCallback();
                                    that.clickedItemCallback(that.selectedItems[i]);
                                }
                            }


                            that.renderList();
                        } else {
                            if (that.itemSelected(actItem)) {
                                if (that.multiSelect) {
                                    that.deselectedItem(actItem)
                                }
                            } else {
                                if (!that.multiSelect) {
                                    that.selectedItems = [];
                                }
                                that.selectedItems.push(actItem);
                            }
                            that.renderList();
                            that.clickedItemCallback(actItem);
                        }


                    }
                };

                if (that.itemSelected(item))
                    var selected = "selected";
                else
                    selected = "";

                if (item.addAll)
                    var addAll = "addAll";
                else
                    addAll = "";


                if (renderItemFunction)
                    var html = renderItemFunction(item, selected + " " + addAll);
                else
                    html = "<li class='" + selected + " " + addAll + "'><a>" + item.name + "</a></li>"


                var element = $(html);
                element.click(callbackFactory(item));
                $(that.filterableDomObject).append(element);

                if((item.farbe||item.id)&&!that.itemSelected(item)){
                    var color =  item.farbe||misc.getColorFromUniqueID(item.id);
                    element.find("a").css("background-color", "#" + color).css("color","#"+ misc.invertRGB(color)).css("text-shadow", "2px 2px 2px #000000");
                }

            }
            $(that.filterableDomObject).listview("refresh");
        }

        $(that.filterableDomObject).find("a").removeClass("ui-btn-icon-right ui-icon-carat-r");


    }


};