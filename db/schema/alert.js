var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var alertSchema = mongoose.Schema({
  userName: {type: String, required: true},
  groupName: {type: String, required: true},
  alertClass: {type: String, required: true}
});

module.exports = mongoose.model('Alert', alertSchema);