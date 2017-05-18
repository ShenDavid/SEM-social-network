
var mongoose = require ('mongoose');
var Schema = mongoose.Schema;



var announcementSchema = mongoose.Schema({
  annData: {type: String, required: true},
  author: {type: String, required: true},
  postedAt: {type: Date, default: Date.now, required: true},
  city: {type: String, default: "", required: true},
  latitude: {type: Number},
  longitude: {type: Number},
  pin: {type: Boolean, default: false}
});

module.exports = mongoose.model('Announcement', announcementSchema);
