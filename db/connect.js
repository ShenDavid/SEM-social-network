'use strict';

var mongoose = require("mongoose");
var config = require("../config.js");

//this contains the authentication for the production server
if(process.env.NODE_ENV === 'production'){
    console.log('in production db');
    this.host = process.env.MONGODB_URI;
} else if (process.env.NODE_ENV === 'test') {
    //console.log('in test mode db');
    this.host = "mongodb://localhost/test";
} else {
    //testing server on local computers
    //console.log("in local db");
    this.host = config.db.host;
}

mongoose.Promise = require('bluebird');

var db = mongoose.connect(this.host,
    {
        server: { poolSize: 5 },
        promiseLibrary: require('bluebird')
    });

module.exports = db;