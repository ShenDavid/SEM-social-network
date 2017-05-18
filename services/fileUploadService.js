/**
 * Created by imrenagi on 3/28/17.
 */
'use strict';
class FileUploadService {

    constructor(fileUploader, imageUploader, videoUploader){
        this.fileUploader = fileUploader;
        this.imageUploader = imageUploader;
        this.videoUploader = videoUploader;
    }

    uploadFiles(files){
        return this.fileUploader.uploadFiles(files);
    }

    uploadImage(imagePath) {
        return this.imageUploader.uploadImage(imagePath);
    }

    uploadVideo(videoPath) {
        return this.imageUploader.uploadVideo(videoPath)
    }
}

module.exports = FileUploadService;