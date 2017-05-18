'use strict';

var mongoose = require('mongoose');
var wildfireArea = require('../schema/wildfireArea.js');

var wildfireAreaModel = mongoose.model('wildfireArea', wildfireArea.wildfireArea);

class wildfireAreaDb {
    constructor(){
    }

    getAllCoordinate(callback){
        // var getCoord = wildfireAreaModel.find({'caller':caller});
        //not sure if using this line
        var getCoord = wildfireAreaModel.find();
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
        var newWildfireArea = new wildfireAreaModel();
        newWildfireArea.creator = data.creator;
        newWildfireArea.name = data.name;
        newWildfireArea.coordinates = data.coordinates;
        newWildfireArea.save(function(err){
            callback(err,newWildfireArea);
        });
    }
    /*
    updateCoordinate(data,callback){
        var conditions = {caller:data.caller}
            ,update = { $set:{ coordinates :data.coordArr}}
            ,options = {nulti:true};
        var query = wildfireAreaModel.update(conditions,update,options);
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
        wildfireAreaModel.find({'name':name}).remove(function(err){
            if(err){
                callback(err);
            }
            else{
                callback(null);
            }
        });
    }

    findByName(name, callback){
        wildfireAreaModel.find({'name':name}, function (err) {
            if(err){
                callback(false);
            }
            else{
                callback(true);
            }
        });
    }
}

module.exports = wildfireAreaDb;