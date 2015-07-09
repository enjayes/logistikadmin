/**
 * chartFactory
 *
 *
 * @author
 * @date 11.12.14 - 23:31
 * @copyright
 */




var PieChart = function (selector, data) {


    var that = this;

    var ctx = $(selector).find(".chart-area")[0].getContext("2d");

    that.pie = new Chart(ctx).Pie(data, {
        percentageInnerCutout: 0,
        animateScale: true,
        animateRotate: true,
        animationEasing: "easeOutBounce",
        animationSteps: 120
    });

    this.clear = function () {
        var length = that.pie.segments.length
        for (var i = 0; i < length; i++) {
            that.pie.removeData(0);
        }
        that.createLegend();
    };

    this.setData = function (data) {

        var dataColors = [
            {
                color: "#F7464A",
                highlight: "#FF5A5E"
            },
            {    color: "#46BFBD",
                highlight: "#5AD3D1"

            } ,
            {    color: "#FDB45C",
                highlight: "#FFC870"

            },
            {
                color: "#F0045C",
                highlight: "#FFC870"
            }
        ]

        for (var i = 0; i < data.length; i++) {
            data[i] = $.extend(data[i],dataColors[i]);
            that.pie.addData(data[i]);

        }

        that.createLegend();

    }

    that.createLegend = function () {

        var legendHolder = $(selector).find(".legend").html(that.pie.generateLegend())
        legendHolder.find("li").each(function (index) {
            $(this).on('mouseover', function () {
                var activeSegment = that.pie.segments[index];
                activeSegment.save();
                activeSegment.fillColor = activeSegment.highlightColor;
                that.pie.showTooltip([activeSegment]);
                activeSegment.restore();
            })
            $(this).on('mouseout', function () {
                that.pie.draw();

            })
        })

    }

    that.createLegend();

}





