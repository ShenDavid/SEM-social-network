/*            Model: Public chat
--------------------------------------------------------*/

var mongoose = require ('mongoose');
var Schema = mongoose.Schema;

/*
Create a mongoDB schema for chat publicly
    messageData: string
    author: string
    target: string
    created: date
    status: number {0: Undefined, 1: OK, 2: Help, 3: Emergency}
    messageType: string {Public, Private}
    location: string (City Name)
    latitude: number
    longitude: number
*/
var attachmentSchema = mongoose.Schema({
  attachmentType: {type: Number, default: 1, required: true},
  name: {type: String, default: "", required: true},
  fileUri: {type: String, default: "", required: true}
});

var messageSchema = mongoose.Schema({
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

module.exports = mongoose.model('Message', messageSchema);
