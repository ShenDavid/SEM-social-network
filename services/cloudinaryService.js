'use strict';
var cloudinary = require('cloudinary');

class CloudinaryService {

    constructor(){
        this.cloudinaryConfig();
    }

    cloudinaryConfig(){
        cloudinary.config({
            cloud_name: 'dzr6cmcyt',
            api_key: '155253419498258',
            api_secret: 'sceQ0ixTvjb8SUvzPPNYeO-ZbZU'
        });
    }

    uploadImage(imageFile){
        return new Promise(function(resolve, reject) {
            cloudinary.v2.uploader.upload(imageFile, { eager: { quality: "jpegmini" }}, function(err, result){
                console.log(result.url);
                if(err)
                    reject(err);
                else
                    resolve(result.url);
            });
        });
    }

    uploadImage(imagePath){
        return new Promise(function(resolve, reject) {
            cloudinary.v2.uploader.upload(imagePath, {}, function(err, result){
                if(err)
                    reject(err);
                else
                    resolve(result.url);
            });
        });
    }

    uploadVideo(videoPath) {
        return new Promise(function(resolve, reject) {
            cloudinary.v2.uploader.upload(videoPath, {resource_type: "video"}, function(err, result){
                console.log(result);
                if(err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
}

module.exports = CloudinaryService;
