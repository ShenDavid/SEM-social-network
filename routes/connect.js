exports.renderConnect = function(req, res, next) {
    res.render('connect', {
      username: req.session.user.username,
      user: req.session.user
    });
};