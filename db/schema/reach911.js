var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reach911 = new Schema({
    caller: { type: String},
    date: { type: Date, default: Date.now},
    address: { type: String},
    type: { type: String, default:'Fire'}, // "Fire", "Police", "Medical"
    // medical, use patient model
    patientlist: {type: Array},
    // fire
    smoke: { type: String },
    smokecolor: { type: String },
    smokequantity: { type: String },
    flame: { type: String },
    injury: { type: String },
    structype: { type: String },
    hmaterial: { type: String },
    insidePeople: { type: String },
    getout: { type: String },
    // police
    weapon: { type: String },
    injured: { type: String },
    suspect: { type: String },
    vehicle: { type: String },
    means: { type: String },
    travel: { type: String },
    safe: { type: String },
    left: { type: String },
    detail: { type: String },
    // for incident
    dispatcher: {type: String},
    creator: { type:String },
    state: {type: String, default: "Waiting"}, // "Waiting", "Triage", "Assigned", "Closed"
    opening_datetime: { type: Date },
    closing_datetime: { type: Date },
    commander: { type: String },
    priority: { type: String }, // "E", "1", "2", "3"
    incidentId: { type: String}, // to generate id for patient and chat
    areaId: { type: mongoose.Schema.Types.ObjectId}
});

module.exports = mongoose.model('reach911', reach911);