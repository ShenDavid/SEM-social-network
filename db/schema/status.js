/*
 * Model: status
 */


// statusCrumb
// userName	User name of user whose status is being updated: String
// statusCode	New emergency status of the user: "GREEN", "YELLOW", "RED"
// createdAt	Timestamp of when this status is recorded
// crumbID	unique ID of this breadcrumb


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statusSchema = new Schema({
	username: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	statusCode: { type: Number, required: true, default: 0 }
	// crumbID : {type: Number, required:true, unique:true}

});

module.exports = mongoose.model('status', statusSchema);
