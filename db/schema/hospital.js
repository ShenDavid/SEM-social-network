/*
 * Model: Hospital
 * Model for hospital collection
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
	name: { type: String, required: true, unique: true },
	address: { type: String, required: true, default: null },
	description: { type: String, required: true, default: null },
	nurses: { type: Array, required: false, default: [] },
	beds: {type: Number, required: true, default: -1}
});

module.exports = mongoose.model('Hospital', hospitalSchema);