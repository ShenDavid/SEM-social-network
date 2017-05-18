/*
 * Model: UserLocation
 * Model for user location collection
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 *		username: string
 *		latitude: string
 *		longitude: string
 *	    address: string
 */

var UserLocation = new Schema({
    username: { type: String, required: true, unique: true },
    latitude: { type: String, required: true},
    longitude: { type: String, required: true},
    address: { type: String, required: true},

});

module.exports = mongoose.model('UserLocation', UserLocation);