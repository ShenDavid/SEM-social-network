var Db = require('../db/db');

var Contact = require('../models/contact');

exports.getAllContacts = function (req, res, next) {
    var db = new Db();
    var contactDAO = new Contact();

    var user = req.session.user;

    if (user === undefined) 
        res.redirect(302, '/');
    else {
        db.start(function (connection) {
            //Get all users
            contactDAO.getAllContacts(user.type, function (err, contactList) {

                db.close(connection, function (ret) {
                    res.render('contact', {
                        username: req.session.username,
                        user: req.session.user,
                        contact_list: contactList,
                    });
                })
            })
        });
    }

};

