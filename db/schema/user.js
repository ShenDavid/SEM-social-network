/*
 * Model: User
 * Model for user collection
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
*		username: string
*		password: string
*		status: 0: undefined, 1: ok (Green), 2: help (yellow), 3: emergency (red)
*		type: 0: civilian, 1: admin, 2: coordinator
*		lastLoginAt is updated when they logout
*		accountStatus: 0: ACTIVE, 1: INACTIVE
*		onlineStatus: 0: online, 1: offline
*   hospitalId: hospital ID if user is a nurse
*   incidentList: list of incident ids related to the user in string format
*/
var userSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	createdAt: { type: Date, default: Date.now, required: true },
	updatedAt: { type: Date, default: Date.now, require: true },
	lastLoginAt: { type: Date, default: Date.now, require: true },
	status: { type: Number, require: true, default: 0 },
	type: { type: Number, required: true, default: 0 },
	accountStatus: { type: Number, required: true, default: 0},
	onlineStatus: { type: Number, require: true, default: 0 },
	location: {type: String, require: true, default:'Not Available'},
	lastStatusUpdate : {type:Date, default: null,require: true},
	lastLogoutAt: { type: String, deafult:null, require: true },
	name: { type: String, required: false},
	dob: { type: String, required: false},
	sex: { type: String, required: false},
	address: { type: String, required: false},
	phone: { type: Number, require: false},
	email: { type: String, required: false},
	conditions: { type: String, required: false},
	drugs: { type: String, required: false},
	allergies: { type: String, required: false},
	emerName: { type: String, required: false},
	emerPhone: { type: Number, required: false},
	emerEmail: { type: String, required: false},
	hospitalId: { type: String, default: null},
	incidentList: { type: Array, default: null}
});

module.exports = mongoose.model('User', userSchema);
