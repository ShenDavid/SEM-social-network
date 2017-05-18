'use strict';

var reach911Db = require('../db/interface/Reach911Db');

var userDb = require('../db/interface/userDb');

class Reach911 {
    constructor() {
    }
    //static method
    static getByCaller(caller,callback){
        var reach911DbInst = new reach911Db();
        reach911DbInst.getByCaller(caller,function(err,rs){
            callback(rs);
        });
    }

    static saveByCaller(data,callback){
        var reach911DbInst = new reach911Db();
        reach911DbInst.addAllpage(data, function(err, rs){
            if(err) callback(false);
            else callback(true);
        });

    }

    static saveReturnID(data,callback){
        var reach911DbInst = new reach911Db();
        reach911DbInst.addAllpage(data, function(err, rs){
            if(err) callback(null);
            else callback(rs);
        });
    }

    // static savePatient(data,callback) {
    //     var reach911DbInst = new reach911Db();
    //     reach911DbInst.addAllpage(data, function (err, rs) {
    //         if (err) callback(false);
    //         else callback(true);
    //     });
    // }

    static getAllUsers(callback){
        var userDbInst = new userDb();

        userDbInst.getAllUsers(function(err, user_list){
            callback(err, user_list)
        });
    }

    static findDispatcherByName(dispatcher, callback){
        var reach911DbInst = new reach911Db();
        reach911DbInst.getByDispatcher(dispatcher, function(err, rs){
            if(err == false){
                callback(err, null);
            }
            else{
                callback(null, rs);
            }
        });
    }
}

module.exports = Reach911;
