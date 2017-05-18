
/*            Model: Notify
--------------------------------------------------------*/

var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var messageSchema = mongoose.Schema({
  username: {type: String, required: true, required: true},
  hasAnnouncement: {type: Boolean, default: false, required: true},
  hasMessage: {type: Boolean, default: false, required: true},
});

module.exports = mongoose.model('Notify', notifySchema);
