/*            Model: Public Chat Bookmark
--------------------------------------------------------*/

var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

var attachmentSchema = mongoose.Schema({
  attachmentType: {type: Number, default: 1, required: true},
  name: {type: String, default: "", required: true},
  fileUri: {type: String, default: "", required: true}
});

var bookmarkSchema = mongoose.Schema({
  username: {type: String, required: true},
  messageData: {type: String, required: true},
  author: {type: String, required: true},
  messageType: {type: String, default: "Wall", required: true},
  receiver: {type: String, default: "PM", required: true},
  postedAt: {type: String, required: true},
  currStatus: {type: String, default: "Undefined", required: true},
  city: {type: String, default: "", required: true},
  latitude: {type: Number},
  longitude: {type: Number},
  attachment: attachmentSchema
});

module.exports = mongoose.model('Bookmark', bookmarkSchema);
