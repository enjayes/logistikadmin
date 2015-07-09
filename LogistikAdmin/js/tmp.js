
var object = function(){
    var that = this;

    this.b = 0;
    this.a = function(a){

        this.b = a;


       var tmp =  function(c){

         setTimeout(function(){
             alert(c)
         },1000)

        }

        tmp(this.b)


    }

}


var obj = new object()

obj.a(1212)
obj.a(234234)


