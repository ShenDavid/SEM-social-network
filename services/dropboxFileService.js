/**
 * Created by imrenagi on 3/28/17.
 */
'use strict';
var Dropbox = require('dropbox');
var fs = require('fs');

class DropboxFileService {

    constructor(){
        this.dbx = new Dropbox({ accessToken: '7RYlkM_tDFAAAAAAAAAACjV40cX-FClLOpQ-CSCSFGrkDD_xlU7XtRH35kZwBId8' });
    }

    uploadFiles(file){
        let that = this;
        return this.dbx.filesUpload({
            contents: fs.readFileSync(file.path),
            path: '/'+file.originalFilename,
            mode: 'add',
            autorename : true,
            mute: true
        }).then(function(response) {
            return that.dbx.sharingCreateSharedLink({path: response.path_display,
                short_url: true});
        });
    }
}

module.exports = DropboxFileService;