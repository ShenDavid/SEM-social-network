/**
 * Created by ZeningZhang on 4/5/17.
 */
"use strict";
var Promise = require('bluebird');

var mongoose = require('mongoose');
var PinDesc = require('../db/schema/pinDesc.js');

var pinModel = mongoose.model('pinDesc', PinDesc.pinDesc);

class pinDesc{

    constructor(username, lat, lng, desc, isPin){
        this.username = username;
        this.lat = lat;
        this.lng = lng;
        this.desc = desc;
        this.isPin = isPin;
    }

    static getPinByName(userName) {
        // console.log("for now the username is " + userName);
        var result = pinModel.find({'username': userName});
        //console.log(result);
        return result;
    }


    addPin() {
        var pin = new pinModel();
        pin.username = this.username;
        pin.lat = this.lat;
        pin.lng = this.lng;
        pin.desc = this.desc;
        pin.isPin = this.isPin;
        return new Promise(function(resolve, reject) {
            pin.save().then()
            .catch(err => reject(err));
        });
    }


    removePin() {
        return pinModel.remove({
            'lat': this.lat,
            'lng': this.lng
        });
    }
}

module.exports = pinDesc;