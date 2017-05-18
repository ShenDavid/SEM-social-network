var Db = require('../db/db');
var Status = require('../models/status');
var User = require('../models/user');
var UserDb = require('../db/interface/userDb');
var StatusDb = require('../db/interface/statusDb');


//status changed
//add a status crumb and update user status
exports.saveStatusCrumb = function (req, res, next) {
    var sess = req.session;
    var r = req.params;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        var db = new Db();
        db.start(function (connection) {
            var userModel = new User();
            var userInfo = {
                username: r.username,
                password: "abcd", //Password doesn't matter, since we're not adding user to database
                status: r.statusCode,
                type: 0
            };

            userModel.updateStatus(userInfo, function (err) {
                if (err) {
                }
                else {
                    sess.user.status = r.statusCode;
                    db.close(connection, function (err) {
                        if (err) {
                        }
                        else {
                            res.status(201).send({statusCode: sess.user.status});
                        }
                    });
                }
            });
        });
    }
};

exports.getStatusCrumbs = function (req, res, next) {
    var db = new Db();
    db.start(function (connection) {
        Status.getStatusCrumbs(req.params.username, function (err, statusCode, crumbs) {
            if (err) {
            }
            else {
                res.status(statusCode).send({crumbs: crumbs});
            }
            db.close(connection, function (ret) {
            });

        });
    });
}

exports.renderStatusPage = function (req, res, next) {
// creating a separate route for share status since it might help 911 capability.
//see if user is logged in
    if (!req.session.username) {
        res.redirect(302, '/');
    } else {

        res.render('shareStatus', {
            user: req.session.user,
            username: req.session.username
        });

    }
}