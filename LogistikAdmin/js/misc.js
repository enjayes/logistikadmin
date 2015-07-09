/**
 * misc
 *
 *
 *
 *
 * @date 20.11.14 - 15:29
 *
 */



misc = {
    titleUnbenannt: "Unbenannt",
    getUniqueID: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    getColorFromUniqueID: function(colorId){
        var colorStr =   colorId.replace(/-/g, "");


        var colorInt = 0;
        for (var j = 0; j < 2; ++j) {
            var hexString = colorStr.slice(j * 16, j * 16 + 16)
            colorInt = colorInt + parseInt(hexString, 16);
        }

        var pad = "000000";

        var str = "" + (colorInt % 16776215).toString(16);
        str = pad.substring(0, pad.length - str.length) + str;


       return str;

    },
    formatDate: function (dateIn) {

        if (typeof dateIn == Number)
            dateIn = new Date(dateIn)

        var yy = dateIn.getFullYear();

        var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
        var dd = dateIn.getDate();
        var hours = dateIn.getHours();
        var mins = dateIn.getMinutes();

        (mm+"").length==1?mm="0"+mm:{};
        (dd+"").length==1?dd="0"+dd:{};
        (hours+"").length==1?hours="0"+hours:{};
        (mins+"").length==1?mins="0"+mins:{};


        return String(dd + "." + mm + "." + yy + "  " + hours + ":" + mins); // Leading zeros for mm and dd

    },
    invertRGB:function(hexnum){
            if(hexnum.length != 6) {
                console.error("Hex color must be six hex numbers in length.");
                return false;
            }

            hexnum = hexnum.toUpperCase();
            var splitnum = hexnum.split("");
            var resultnum = "";
            var simplenum = "FEDCBA9876".split("");
            var complexnum = new Array();
            complexnum.A = "5";
            complexnum.B = "4";
            complexnum.C = "3";
            complexnum.D = "2";
            complexnum.E = "1";
            complexnum.F = "0";

            for(i=0; i<6; i++){
                if(!isNaN(splitnum[i])) {
                    resultnum += simplenum[splitnum[i]];
                } else if(complexnum[splitnum[i]]){
                    resultnum += complexnum[splitnum[i]];
                } else {
                    console.error("Hex colors must only include hex numbers 0-9, and A-F");
                    return false;
                }
            }

            return resultnum;
        }



}