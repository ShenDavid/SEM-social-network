/*
 * Model: Item
 * Model for item collection
 * Epic: Manage Inventory
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/*
*		firechiefName: String => id of the fire chief
*   checkoutBy: String => user id of who checked it out
*   name: String
*   consumable: Boolean
*/
var itemSchema = new Schema({
	firechiefName: { type: String, required: true },
	checkoutBy: { type: String, default: ""},
	name: { type: String, required: true },
	consumable: { type: Boolean, default: false, require: true },
});

module.exports = mongoose.model('Item', itemSchema);
