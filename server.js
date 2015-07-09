/**
 * Main Server
 */


var server_port = process.env.OPENSHIFT_NODEJS_PORT ;// || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP ;//|| '127.0.0.1'

var sql_server_port = process.env.OPENSHIFT_MYSQL_DB_PORT;// || 3306
var sql_server_ip_address = process.env.OPENSHIFT_MYSQL_DB_HOST ;//|| '127.0.0.1'


var server_port = process.env.OPENSHIFT_NODEJS_PORT ;// || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP ;//|| '127.0.0.1'

var sql_server_port = process.env.OPENSHIFT_MYSQL_DB_PORT;// || 3306
var sql_server_ip_address = process.env.OPENSHIFT_MYSQL_DB_HOST ;//|| '127.0.0.1'

var preferences = null; //preferencesCloud (auto) OR preferencesLocal (auto,online database) OR preferencesLocalSQL (local databse)

// General Preferences
var preferencesCloud = {
    mode:2,
    port: server_port,
    ip: server_ip_address,
    mysql: {
        host: sql_server_ip_address,
        port: sql_server_port,
        user: 'admin1lvarUX',
        password: '8Ny5vS64wYVm',
        database: 'logistikdb'
    },
    serverdirectory: __dirname
}

var preferencesLocal = {
    mode:1,
    port: 3142,
    ip: "localhost",
    mysql: {
        host: "nodejs-edeka.rhcloud.com",//"127.2.197.2",//sql_server_ip_address,
        port:  3306,// sql_server_port,
        user: 'admin1lvarUX',
        password: '8Ny5vS64wYVm',
        database: 'logistikdb'
    },
    serverdirectory: __dirname
}

var preferencesLocalSQL = {
    mode:1,
    port: 3142,
    ip: "localhost",
    mysql: {
        host: 'localhost',
        port: 3306,
        user: 'logistikuser',
        password: 'logistikpasswort',
        database: 'logistikdb'
    },
    serverdirectory: __dirname
}

if(process.env.OPENSHIFT_NODEJS_PORT == undefined){
    preferences = preferencesLocalSQL; // preferencesLocalSQL
    preferences.alternative = preferencesCloud;
}
else{
    preferences = preferencesCloud;
    preferences.alternative = preferencesLocalSQL;
}


//TODO remove
//npreferences   = preferencesLocalSQL;




//Express Server
var express = require("express"),
    app = express();

//Http Handler
var http = require('http').createServer(app);

//Socket.IO
var io = require('socket.io')(http);


//CryptoJS
var CryptoJS = require("crypto-js");

//momentJS
var momentJS = require("moment");


//Load Controllers

var connectionController = require('connectionController');
var adminController = require('admincontroller/adminController.js');
var appController = require('appcontroller/appController.js');
var dataController = require('dataController.js');


//Init Controllers

dataController.init(preferences,CryptoJS,momentJS);

connectionController.init(preferences,io,http,adminController,appController);
adminController.init(preferences,dataController,io,app,express);
appController.init(preferences,dataController,io,app,express);




/*
 // Load the twilio module
 var twilio = require('twilio');

 // Create a new REST API client to make authenticated requests against the
 // twilio back end





 client.makeCall({

 to: '+4917696276213', // Any number Twilio can call
 from:'+4915735981417', // A number you bought from Twilio and can use for outbound communication
 url: "http://twimlets.com/message?Message=Hey%20Darling,%20the%20text%20to%20speech%20calls%20are%20working%20now!%20Some%20information%20about%20beer:%20Beer%20is%20an%20alcoholic%20beverage%20produced%20by%20the%20saccharification%20of%20starch%20and%20fermentation%20of%20the%20resulting%20sugar.%20The%20starch%20and%20saccharification%20enzymes%20are%20often%20derived%20from%20malted%20cereal%20grains,%20most%20commonly%20malted%20barley%20and%20malted%20wheat.%20Most%20beer%20is%20also%20flavoured%20with%20hops,%20which%20add%20bitterness%20and%20act%20as%20a%20natural%20preservative,%20though%20other%20flavourings%20such%20as%20herbs%20or%20fruit%20may%20occasionally%20be%20included.%20The%20preparation%20of%20beer%20is%20called%20brewing." // A URL that produces an XML document (TwiML) which contains instructions for the call

 }, function(err, responseData) {
 console.log("call done!");
 //executed when the call has been initiated.

 if (err) {
 console.log(err);
 console.log('Oops! There was an error.');
 }
 console.log(responseData.from); // outputs "+14506667788"

 });


 // Pass in parameters to the REST API using an object literal notation. The
 // REST client will handle authentication and response serialzation for you.
 client.sms.messages.create({
 to:'+491784598782',
 from:'+4915735981417',
 body:'Edeka App - node.js: ahoi! Du oida Dedler, a Lieferant is am Tabletski!!! Text-to-speech coming soon;)'
 }, function(error, message) {
 // The HTTP request to Twilio will run asynchronously. This callback
 // function will be called when a response is received from Twilio
 // The "error" variable will contain error information, if any.
 // If the request was successful, this value will be "falsy"
 if (!error) {
 // The second argument to the callback will contain the information
 // sent back by Twilio for the request. In this case, it is the
 // information about the text messsage you just sent:
 console.log('Success! The SID for this SMS message is:');
 console.log(message.sid);

 console.log('Message sent on:');
 console.log(message.dateCreated);
 } else {
 console.log(error);
 console.log('Oops! There was an error.');
 }
 });
 */






