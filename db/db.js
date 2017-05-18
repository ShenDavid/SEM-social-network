'use strict';

var mongoose = require("mongoose");
var config = require("../config.js");

class Db {
	constructor(){
		//this contains the authentication for the production server
		if(process.env.NODE_ENV === 'production'){
			console.log('in production db');
			this.host = process.env.MONGODB_URI;
		} else if (process.env.NODE_ENV === "test") {
			//console.log('in test mode db');
			this.host = "mongodb://localhost/test";
		} else {
			//testing server on local computers
			//console.log("in local db");
			this.host = config.db.host;
		}
	}

	start(callback){
		var db = mongoose.createConnection(this.host, function(err){
			if (err) {
				console.log("Error connection: " + err.stack);
				callback(true);
				return;
			}
		});
		db.once('open', function(){
			callback(db);
			return;
		});
	}

	close(connection, callback){
		connection.close(callback);
		//console.log('db connection closed');
		// callback(false);
		return;
	}
}

module.exports = Db;
