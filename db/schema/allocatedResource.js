var mongoose = require('../connect');

var allocatedResourceSchema = mongoose.Schema({
  vehicleOrPersonnelId: {type: mongoose.Schema.Types.ObjectId, required: true},
  areaOrIncidentId: {type: mongoose.Schema.Types.ObjectId, required: true},
  isVehicle: {type: Boolean, required: true, default: true},
  isArea: {type: Boolean, required: true, default: true},
  vehicleIndex: {type: Number, required: false},
  name: {type: String, required: true},
});

module.exports = mongoose.model('AllocatedResource', allocatedResourceSchema);
