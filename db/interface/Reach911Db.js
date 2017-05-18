/**
 * Created by sxh on 17/3/20.
 */

'use strict';

var mongoose = require('mongoose');
var reach911 = require('../schema/reach911.js');

var reach911Model = mongoose.model('reach911', reach911.reach911);

class reach911Db {
    constructor(){
    }

    addFirstPage(data,callback){
        var emergency = new reach911Model();
        emergency.caller = data.caller;
        emergency.address = data.address;
        emergency.dispatcher = data.dispatcher;
        emergency.save(function(err){
            console.log(err);
            callback(err,emergency);
        });
    }

    getByCaller(caller,callback){
        var getEmergency = reach911Model.find({'caller':caller});
        getEmergency.exec(function(err,rs){
            if(err){
                callback(false,null);
            }else if(rs.length == 0){
                callback(true,null);
            } else{
                callback(true,rs);
            }
        });
    }

    getByDispatcher(dispatcher,callback){
        console.log(dispatcher);
        var getEmergency = reach911Model.find({'dispatcher':dispatcher});
        getEmergency.exec(function(err,rs){
            if(rs){
                callback(true,rs);
            }else{
                callback(false,null);
            }
        });
    }

    addAllpage(data, callback){
        var emergency = new reach911Model();
        emergency.caller = data.caller;
        emergency.address = data.address;
        emergency.dispatcher = data.dispatcher;
        emergency.type = data.type;
        emergency.incidentId = data.incidentId;
        if (data.type == "Medical") {
            emergency.isPatient = data.isPatient;
            emergency.patientlist = data.patientlist;
        }
        else if (data.type == "Fire") {
            emergency.smoke = data.smoke;
            emergency.smokecolor =  data.smokecolor;
            emergency.flame = data.flame;
            emergency.smokequantity = data.smokequantity;
            emergency.injury = data.injury;
            emergency.getout = data.getout;
            emergency.insidePeople = data.insidePeople;
            emergency.structype = data.structype;
        }
        else if (data.type == "Police") {
            emergency.suspect = data.suspect;
            emergency.injured =  data.injured;
            emergency.vehicle = data.vehicle;
            emergency.safe = data.safe;
            emergency.left = data.left;
            emergency.means = data.means;
            emergency.travel = data.travel;
            emergency.detail = data.detail;
        }
        emergency.save(function(err){
            console.log(err);
            callback(err,emergency);
        });
    }

    // updateFirstPage(data, callback){
    //     var conditions = {caller:data.caller}
    //         ,update = { $set:{ date:data.date, address:data.address}}
    //         ,options = {nulti:true};
    //     var query = reach911Model.update(conditions,update,options);
    //     query.exec(function(err,doc){
    //         callback(err);
    //     });
    // }

    // updateSecondPage(data,callback){
    //     var conditions = {caller:data.caller}
    //         ,update = { $set:{ type:data.type}}
    //         ,options = {nulti:true};
    //     var query = reach911Model.update(conditions,update,options);
    //     query.exec(function(err,doc){
    //         callback(err);
    //     });
    // }
    // updateThirdPage(data,callback) {
    //     var conditions = {caller: data.caller}
    //     if (data.type == "Medical") {
    //         var update = {
    //             $set: {
    //                 isPatient: data.isPatient,
    //                 age: data.age,
    //                 sex: data.sex,
    //                 conscient: data.conscient,
    //                 breathing: data.breathing,
    //                 complaint: data.complaint
    //             }
    //         }
    //     }
    //     else if (data.type == "Fire") {
    //         var update = {
    //             $set: {
    //                 smoke: data.smoke,
    //                 smokecolor: data.smokecolor,
    //                 flame: data.flame,
    //                 smokequantity: data.smokequantity,
    //                 injury: data.injury,
    //                 hmaterial: data.hmaterial,
    //                 getout: data.getout,
    //                 insidePeople: data.insidePeople,
    //                 structype: data.structype
    //             }
    //         }
    //     }
    //     else if (data.type == "Police") {
    //         var update = {
    //             $set: {
    //                 suspect: data.suspect,
    //                 injured: data.injured,
    //                 vehicle: data.vehicle,
    //                 safe: data.safe,
    //                 left: data.left,
    //                 means: data.means,
    //                 travel: data.travel,
    //                 detail: data.detail
    //             }
    //         }
    //     }
    //     var options = {nulti:true};
    //     var query = reach911Model.update(conditions,update,options);
    //     query.exec(function(err,doc){
    //         callback(err);
    //     });
    // }
    // updateAllByCaller(data,callback){
    //     var conditions = {caller:data.caller}
    //         ,update = { $set:{ address:data.address,type:data.type,isPatient:data.isPatient, age:data.age, sex:data.sex, conscient:data.conscient,breathing:data.breathing,complaint:data.complaint}}
    //         ,options = {nulti:true};
    //     var query = reach911Model.update(conditions,update,options);
    //     query.exec(function(err,doc){
    //         if(err){
    //             callback(false);
    //         }else{
    //             callback(true);
    //         }
    //     });
    // }
    deleteByCaller(caller, callback){
        reach911Model.find({'caller':caller}).remove(function(err){

                callback(err);

        });
    }
}

module.exports = reach911Db;