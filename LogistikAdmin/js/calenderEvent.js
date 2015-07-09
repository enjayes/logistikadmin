/**
 * calenderEvent
 *
 *
 *
 *
 * @date 20.11.14 - 01:07
 *
 */


CalenderEvent = function () {
    this.marktid=null;
    this.id = misc.getUniqueID();
    this.title = "";
    this.start = "";
    this.end = null;
    this.allDay = false;
    this.notizen = "";
    this.lieferant = "";
    this.repeatDays = 0;
    this.alarm = 0;

}


CalenderEventFactory = {
    create: function (title, start,lieferant) {

        console.log(start.hasTime())
        console.log(start.format())

        var event =   new CalenderEvent();
        event.title = title;

        if(!start.hasTime())
            event.allDay = true;

        event.start = start;

        if(lieferant)
         event.lieferant = lieferant;

        return event;

    }
}