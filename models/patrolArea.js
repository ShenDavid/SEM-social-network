'use strict';

var config = require('../config.js');
var Db = require('../db/db');
var patrolAreaDb = require('../db/interface/patrolAreaDb');
var Promise = require("bluebird");


class PatrolArea {
    constructor() {
    }
    //static method
    static getAllCoordinate(callback){
        var patrolAreaDbInst = new patrolAreaDb();
        patrolAreaDbInst.getAllCoordinate(function(err,rs){
            callback(rs);
        });
    }

    static addCoordinate(data, callback){
        var patrolAreaDbInst = new patrolAreaDb();
        patrolAreaDbInst.addCoordinate(data, function(err,rs){
            callback(rs);
        });
    }

    static deleteByName(data, callback){
        var patrolAreaDbInst = new patrolAreaDb();
        patrolAreaDbInst.deleteByName(data.name, function(err){
            callback(err);
        });
    }

    static findByName(data, callback){
        var patrolAreaDbInst = new patrolAreaDb();
        patrolAreaDbInst.findByName(data.name, function(err){
            callback(err);
        });
    }

}

module.exports = PatrolArea;
