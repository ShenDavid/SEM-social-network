/**
 * Created by G on 17/4/30.
 */

var config = require('../config');

exports.showOcr = function(req, res) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        res.render('ocr');
    }
}