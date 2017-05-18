var mongoose = require ('../connect');

var groupInfoSchema = mongoose.Schema({
    groupName: {type: String, required: true},
    groupOwner: {type: String, required: true},
    groupDescription: {type: String, required: false}
});

module.exports = mongoose.model('Group', groupInfoSchema);
