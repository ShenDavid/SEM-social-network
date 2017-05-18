exports.renderRegisterHospital = function(req, res, next){
	var requestName = '';

	if (req.params.hospitalName) {
		requestName = req.params.hospitalName;		
	}

  	res.render('registerHospital', {
		username: req.session.username,
		user: req.session.user,
		requestName: requestName
  	});
};