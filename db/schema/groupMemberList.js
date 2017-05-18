var mongoose = require ('../connect');

var groupMemberListSchema = mongoose.Schema({
    groupName: {type: String, required: true},
    groupMember: {type: String, required: true},
    ifAlert: {type: Boolean, default: false}
});

module.exports = mongoose.model('GroupMemberList', groupMemberListSchema);
