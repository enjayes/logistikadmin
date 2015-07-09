/**
 * multipleSelection
 *
 *
 * @author
 * @date 13.12.14 - 16:39
 * @copyright
 */


var MultipleSelectionWidget = function (domObject, radio, clickedItemCallback) {

    var that = this;
    this.internalName = "multipleSelection" + Date.now() + "x" + ((Math.random() * 1000000.0) + "").replace(".", "");
    this.domObject = domObject;
    this.data = null;
    this.radio = radio;
    that.clickedItemCallback = clickedItemCallback;
    if (!this.radio)
        this.type = "checkbox";
    else
        this.type = "radio";

    var html = '<fieldset id="' + that.internalName + '" class="multipleselections" data-role="controlgroup" data-mini="true" data-type="horizontal" style="margin:0px"></fieldset>';

    $(that.domObject).append(html);
    $(that.domObject + " #" + this.internalName).controlgroup();

    that.domObjectInner = $(domObject + " #" + that.internalName + " .ui-controlgroup-controls");


    this.setData = function (data, clickedItemCallback, selectAll, minimumOneSelected, onlyOneSelected) {

        if (!data)
            data = [];

        if (clickedItemCallback)
            that.clickedItemCallback = clickedItemCallback;

        that.data = $.extend(true, [], data);

        var html = "";

        for (var i = 0; i < data.length; i++) {
            var name = that.internalName + 'x' + i;

            if (!this.radio)
                var groupName = "";
            else
                groupName = 'name="' + that.internalName+'"';

            html += '<input type="' + that.type + '" '+groupName+' data-objindex="' + i + '" id="' + name + '">' +
                '<label for="' + name + '">' + data[i].name + '</label>'
        }
        $(that.domObjectInner).append(html);

        var checkboxradios = that.domObjectInner.find('input').checkboxradio();

        if (checkboxradios.length) {
            checkboxradios.parent("div").click(function (event) {
                var checkboxRadio = $(this).find("input");
                if (checkboxRadio.length == 0)
                    return;


                var reselected = false;

                //Keiner ausgewählt
                if (minimumOneSelected) {

                    var selected = that.domObjectInner.find("label.ui-btn-active");
                    if (selected.length == 1) {
                        if (selected.filter("[for=" + checkboxRadio[0].id + "]").length == 1) {
                            setTimeout(function () {
                                checkboxRadio.prop("checked", true).checkboxradio("refresh");
                            }, 0);
                            reselected = true;
                            event.stopPropagation();
                        }
                    }
                }
                if (!reselected && onlyOneSelected) {

                    var selected = that.domObjectInner.find("label.ui-btn-active");
                    if (selected.length > 0) {
                        setTimeout(function () {

                            selected.each(function () {
                                var selectedItem = that.domObjectInner.find("#" + $(this).attr("for"));
                                selectedItem.prop("checked", false).checkboxradio("refresh");

                            })
                        }, 0);
                    }
                }


                if (!reselected)
                    if (that.clickedItemCallback) {
                        var index = checkboxRadio.data("objindex")
                        var obj = that.data[index];
                        if (obj) {
                            that.clickedItemCallback(obj);
                        }
                    }


            })


            if (that.radio) {

                $(checkboxradios[0]).prop("checked", true).checkboxradio("refresh");


                if (that.data.length > 0&&that.clickedItemCallback)
                    that.clickedItemCallback(that.data[0]);
            } else if (selectAll) {
                checkboxradios.prop("checked", true).checkboxradio("refresh");

            }

            $(that.domObject + " #" + this.internalName).controlgroup("refresh");

        }


        if (minimumOneSelected && onlyOneSelected) {
            $(that.domObjectInner.find('input')[0]).prop("checked", true).checkboxradio("refresh");

        }

    };


    this.selectedSingleItem = function (dataId) {
        if(!dataId)
          return;

        var items =  that.domObjectInner.find("input");
        if (items.length > 0) {

            for (var i = 0; i < items.length; i++) {
                var selectedItem = $(items[i]);
                if(that.data[i].id==dataId){
                    selectedItem.prop("checked", true);
                }else
                    selectedItem.prop("checked", false);

                selectedItem.checkboxradio("refresh");
            }
        }


    }



    this.getSelectedItems = function () {
        var selectedItems = [];
        var items =  that.domObjectInner.find("input");
        if (items.length > 0) {

            for (var i = 0; i < items.length; i++) {

                var selectedItem = $(items[i]);
                if(selectedItem.prop("checked")){
                    selectedItems.push(that.data[i])
                }
            }

            selectedItems = $.extend(true, [], selectedItems);
        }
        return selectedItems;

    }

}



