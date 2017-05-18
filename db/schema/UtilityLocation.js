/*
 * Model: UtilityLocation
 * Model for utility location collection
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 *		utilityID: string
 *		latitude: string
 *		longitude: string
 *      address: string
 *      category: string
 */

var UtilityLocation = new Schema({
    utilityID: { type: String},
    latitude: { type: String, required: true},
    longitude: { type: String, required: true},
    address: { type: String, required: true},
    category: { type: String, required: true}
});

module.exports = mongoose.model('UtilityLocation', UtilityLocation);