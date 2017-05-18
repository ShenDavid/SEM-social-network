/*
 * Model: Organization
 * Model for organization chart collection
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
 *    responderName: string
 *    chiefName: string
 *    organization Type: 0: none, 1: firefighter, 2: patrol
 */
//ASK require or required??
var organizationSchema = new Schema({
    responderName: { type: String, required: true, unique: true },
    chiefName: { type: String, required: true },
    organizationType: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Organization', organizationSchema);
