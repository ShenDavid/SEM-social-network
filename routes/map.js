var Db = require('../db/db');
var User = require('../models/user');
var userDb = require('../db/interface/userDb')
var Message = require('../models/message');
var Group = require('../models/group');
var Pin = require('../models/pinDesc');
var Promise = require("bluebird");


exports.viewMap = function (req, res, next) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        //
        console.log("in map");
        var db = new Db();

        //start db connection
        db.start(function (connection) {
            //Get user_list and get last 100 messages
            Message.getAllPublicMessages(function (user_list, message_list) {
                var active_users = new Array();
                if (user_list)
                    for (var i = user_list.length - 1; i >= 0; i--) {
                        if (user_list[i].accountStatus == 0) active_users.push(user_list[i].username);
                    }
                ;
                if (message_list)
                    for (var i = message_list.length - 1; i >= 0; i--) {
                        if (active_users.indexOf(message_list[i].author) == -1) message_list.splice(i, 1);
                    }
                ;

                // Group.getAllGroups(function(err, groupData){
                Group.getMyGroups(sess.username).then(groupData => {
                    var groups = new Array();
                if (groupData)
                    for (var i = groupData.length - 1; i >= 0; i--) {
                        groups.push(groupData[i].groupName);
                        console.log(groupData[i].groupName);
                    }
                ;
                Pin.getPinByName(sess.username).then(pinData => {
                    db.close(connection, function (ret) {
                    res.render('map', {
                        author: sess.username,
                        username: sess.username,
                        receiver: "PM",
                        user_list: active_users,
                        user: sess.user,
                        message_list: message_list,
                        chatlist: sess.userchatlist,
                        group_list: groups,
                        pins : pinData
                    });
                });
            }
                ).
                catch(err => {
                    res.status(500).send(err);
            })
                ;

            })
                .
                catch(err => {
                    console.log(err);
                res.status(500).send(err)

            })
                ;

                // });

            });
        });
    }
};

exports.addPin = function (req, res, next) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        //start db connection
        var pin = new Pin(sess.username, req.body.lat, req.body.lng, req.body.desc, req.body.isPin);
        pin.addPin().then()
            .catch((err) => {
            console.log(err);
            res.status(500).send(err);
    })
        ;
    }

}

exports.deletePin = function (req, res, next) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        //start db connection
        var pin = new Pin(sess.username, req.body.lat, req.body.lng);
        pin.removePin().then()
            .catch((err) => {
            console.log(err);
        res.status(500).send(err);
    })
        ;
    }

}

exports.getGroupMembersByGroupName = function(req, res, next){
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        //start db connection
        // Group.getAllGroups(function(err, groupData){
        Group.getGroupMembersByGroupName(req.params.groupname).then(groupData => {
            var groups = new Array();
        if (groupData)
            for (var i = groupData.length - 1; i >= 0; i--) {
                groups.push(groupData[i].groupMember);
                console.log(groupData[i].groupMember);
            }
            res.status(200).send(groups);
        ;
    });
    }
}


// exports.getAllPin = function (req, res, next) {
//     var sess = req.session;
//     if (!sess.username) {
//         res.redirect(302, '/');
//     } else {
//         //start db connection
//         Pin.getPinByName(sess.username).then(pins => {
//
//             console.log(pins);
//             res.status(200).send(pins);
//     })
//     .catch(err => res.status(500).send(err));
//
//     }
//
// }


