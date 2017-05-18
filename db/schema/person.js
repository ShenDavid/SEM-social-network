var mongoose = require ('mongoose');
var Schema = mongoose.Schema;



var personSchema = mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	age: { type: Number, required: true},
 	location: {type: String, required: true},
 	reporter: {type: String, required: true},
 	relationship: {type: String, required: true},
 	status: {type: String, required: true, default:"Missing"},
 	foundBy: {type: String, required: true, default:"notFound"}

});

module.exports = mongoose.model('Person', personSchema);
