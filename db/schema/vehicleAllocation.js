/*
 * Model: VehicleAllocation
 * Model for vehicle allocation
 * ESN-110 - Police Car Allocation at Login
 */

var mongoose = require('../connect');
var Schema = mongoose.Schema;


var vehicleAllocationSchema = new Schema({
    vehicleID: {type: String, required: true,  unique: true},
    vehicleType: {type: Number, required: true, default: 0},
    allocatedOfficers: [String]
});

module.exports = mongoose.model('VehicleAllocation', vehicleAllocationSchema);
