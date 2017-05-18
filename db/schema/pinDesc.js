var mongoose = require ('../connect');
var Schema = mongoose.Schema;



var pinDesc = mongoose.Schema({
    username: { type: String, required: true},
    lat: { type: String, required: true},
    lng: { type: String, required: true},
    desc: { type: String, required: true},
    isPin : { type: Boolean },
});

module.exports = mongoose.model('pinDesc', pinDesc);
