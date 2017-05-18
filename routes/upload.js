var DropboxService = require('../services/dropboxFileService');
var CloudinaryService = require('../services/cloudinaryService');
var FileUploaderService = require('../services/fileUploadService');

var dropboxService = new DropboxService();
var cloudinaryService = new CloudinaryService();
var fileUploaderService = new FileUploaderService(dropboxService, cloudinaryService, null);

var multiparty = require('multiparty');

exports.uploadData = function(req, res, next){
    if (!req.session.username){
        res.redirect(302, '/');
    } else {
        console.log("testing");

        var form = new multiparty.Form();
        var datatype = req.params.datatype;

        form.parse(req, function(err, fields, files) {
            if (datatype === 'file') {
                    fileUploaderService.uploadFiles(files.uploads[0])
                    .then(function(response) {
                        console.log(response);
                        res.send(JSON.stringify(response));
                    })
                    .catch(function(error) {
                        console.log(error);
                        res.send(JSON.stringify(error));
                    })

            } else if (datatype == 'image') {

                fileUploaderService.uploadImage(files.uploadsimg[0].path)
                    .then(function(response) {
                        res.send(JSON.stringify(response));
                    })
                    .catch(function(error) {
                        console.log(error);
                        res.send(JSON.stringify(error));
                    })

            } else if (datatype == 'video') {

                fileUploaderService.uploadVideo(files.uploadsvideo[0].path)
                    .then(function(response) {
                        res.send(JSON.stringify(response.url));
                    })
                    .catch(function(error) {
                        console.log(error);
                        res.send(JSON.stringify(error));
                    })

            } else {
                res.send(JSON.stringify({}));
            }
        });

    }
};