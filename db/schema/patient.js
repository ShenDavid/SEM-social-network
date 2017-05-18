/*
 * Model: Patient
 * Model for patient collection
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
*		incidentId: String (id of an incident if it exists)
*       hospital: String (id of the hospital patient is at, if exists)
*       priority: 0: E (immediate), 1: Urgent, 2: Could Wait, 3: Dismiss, 4: Dead
*		location: 0: Road, 1: ER
*		name: String
*		dateOfBirth: Date
*		lastLoginAt is updated when they logout
*		accountStatus: 0: ACTIVE, 1: INACTIVE
*		onlineStatus: 0: online, 1: offline
*/
var patientSchema = new Schema({
    id: { type: String, unique: true },
    incidentId: { type: String },
    hospitalName: { type: String },
    hasBed: { type: Boolean },
    priority: { type: Number, required: true },
    location: { type: Number },
    name: { type: String },
    dateOfBirth: { type: Date, default: Date.now },
    age: { type: Number },
    sex: { type: Boolean },
    conscious: { type: Boolean },
    normalBreathing: { type: Boolean },
    complaint: { type: String, default: null},
    condition: { type: Number, require: true},
    drugs: { type: String, default: null},
    allergies: { type: String, default: null}
});

module.exports = mongoose.model('Patient', patientSchema);
