var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var wildfireArea = new Schema({
    // caller: { type: String, required: true, unique: true },
    // date: { type: Date, default: Date.now,required: true },
    // address: { type: String, required: true },
    // type: { type: String, default:'Fire', required: true },
    // isPatient: { type: String, default:'YES', required: true },
    // age: { type: Number, required: true, default: 0 },
    // sex: { type: String, required: true, default: 'Male' },
    // conscient: { type: String, default:'YES',required: true},
    // breathing: { type: String, default:'YES', required: true },
    // complaint : {type: String, required: true, default:'Not Available'},
    // creator : {type:String},
    // commander: { type: String},
    coordinates : {type : Array, required : true},
    creator : {type:String},
    name : {type:String}
});

module.exports = mongoose.model('wildfireArea', wildfireArea);