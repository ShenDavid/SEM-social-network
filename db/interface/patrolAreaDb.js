'use strict';

var mongoose = require('mongoose');
var patrolArea = require('../schema/patrolArea.js');

var patrolAreaModel = mongoose.model('patrolArea', patrolArea.patrolArea);

class patrolAreaDb {
    constructor(){
    }

    getAllCoordinate(callback){
        // var getCoord = patrolAreaModel.find({'caller':caller});
        //not sure if using this line
        var getCoord = patrolAreaModel.find();
        getCoord.exec(function(err,rs){
            if(err){
                callback(false,null);
            }else if(rs.length == 0){
                callback(true,null);
            } else{
                callback(true,rs);
            }
        });
    }

    addCoordinate(data, callback){
        var newPatrolArea = new patrolAreaModel();
        newPatrolArea.creator = data.creator;
        newPatrolArea.name = data.name;
        newPatrolArea.coordinates = data.coordinates;
        newPatrolArea.save(function(err){
            callback(err,newPatrolArea);
        });
    }
    /*
    updateCoordinate(data,callback){
        var conditions = {caller:data.caller}
            ,update = { $set:{ coordinates :data.coordArr}}
            ,options = {nulti:true};
        var query = patrolAreaModel.update(conditions,update,options);
        query.exec(function(err,doc){
            if(err){
                callback(false, doc);
            }else{
                callback(true, doc);
            }
        });
    }
*/
    deleteByName(name, callback){
        patrolAreaModel.find({'name':name}).remove(function(err){
            if(err){
                callback(err);
            }
            else{
                callback(null);
            }
        });
    }

    findByName(name, callback){
        patrolAreaModel.find({'name':name}, function (err) {
            if(err){
                callback(false);
            }
            else{
                callback(true);
            }
        });
    }
}

module.exports = patrolAreaDb;