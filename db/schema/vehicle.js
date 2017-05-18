/*
 * Model: Vehicle
 * Model for vehicle collection
 */

var mongoose = require('../connect');
var Schema = mongoose.Schema;


var vehicleSchema = new Schema({
    chiefName: {type: String, required: true,  unique: true},
    total: {type: Number, required: true, default: 0},
    allocated: {type: Number, required: true, default: 0},
    allocatedIdx: {type: Array}
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
