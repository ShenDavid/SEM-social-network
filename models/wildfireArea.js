'use strict';

var config = require('../config.js');
var Db = require('../db/db');
var wildfireAreaDb = require('../db/interface/wildfireAreaDb');


class WildfireArea {
    constructor() {
    }
    //static method
    static getAllCoordinate(callback){
        var wildfireAreaDbInst = new wildfireAreaDb();
        wildfireAreaDbInst.getAllCoordinate(function(err,rs){
            callback(rs);
        });
    }

    static addCoordinate(data, callback){
        var wildfireAreaDbInst = new wildfireAreaDb();
        wildfireAreaDbInst.addCoordinate(data, function(err,rs){
            callback(rs);
        });
    }

    static deleteByName(data, callback){
        var wildfireAreaDbInst = new wildfireAreaDb();
        wildfireAreaDbInst.deleteByName(data.name, function(err){
            callback(err);
        });
    }

    static findByName(data, callback){
        var wildfireAreaDbInst = new wildfireAreaDb();
        wildfireAreaDbInst.findByName(data.name, function(err){
            callback(err);
        });
    }

}

module.exports = WildfireArea;
