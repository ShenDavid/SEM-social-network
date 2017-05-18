'use strict';

var mongoose = require('mongoose');
var person = require('../schema/person.js');

var PersonModel = mongoose.model('Person', person.personSchema);

class personDb {
  constructor(){
  }
  addPerson(data, callback){
    var person = new PersonModel();
    person.firstName = data.firstName;
    person.lastName = data.lastName;
    person.age = data.age;
    person.location = data.location;
    person.reporter = data.reporter;
    person.relationship = data.relationship;
    person.save(function(err){
      callback(err, person);
    });
  }



  //for search
  getMatchingPersons(keyword,callback){
    var list;
    PersonModel.find({'firstName':{'$regex': '.*'+keyword+'.*'}}, function(err, users1){
      PersonModel.find({'lastName':{'$regex': '.*'+keyword+'.*'}}, function(err, users2){
        list = users1.concat(users2);
        if (list.length == 0) callback(err,null);
        else callback(err, list);
      });
    });

  }

  getAllPersons(callback){
    PersonModel.find({}).sort({firstName: 1}).exec(function(err, people){
      callback(err, people);
    });
  }

  changeStatus(personId, foundByUser, callback) {
    var updateQuery = {status: "Found", foundBy: foundByUser};
    PersonModel.findOneAndUpdate({'_id' : personId}, updateQuery,
      {new: true},
      function(err, updated_person){
        callback(err, updated_person);
      });
  }

  deletePerson(personId, callback){
    PersonModel.find({'_id' : personId}).remove(function(err) {
      callback(err);
    });

  }

  samePersonExists(firstName,lastName,age, callback){
    PersonModel.findOne({'firstName' : firstName, 'lastName' : lastName,'age' : age, 'status' : 'Missing'} , function(err, person) {
      callback(err, person);
    });

  }

}

module.exports = personDb;
