'use strict';

var PersonDb = require('../db/interface/personDb');

class Person {
  constructor(firstName, lastName, age, location, reporter,relationship){

    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.location = location;
    this.reporter = reporter;
    this.relationship = relationship;

  }

  static isMissing(obj){
    return (obj.status === "Missing");
  }

  static isFound(obj){
    return (obj.status === "Found");
  }


  savePerson(callback) {
    var personDbInst = new PersonDb();
    var person = this;
    personDbInst.addPerson(person, function(err, personData){
      callback(err, personData);
    });
  }

  static isValidData(firstName,lastName, age, location, relationship, callback){
    if (firstName == "" || lastName == "" || isNaN(age) || location == "" || relationship == "") callback(false);
    else callback(true);
  }

  static getMatchingPersons(keyword, callback) {
    var personDbInst = new PersonDb();
    personDbInst.getMatchingPersons(keyword,function(err, person_list){
      callback(err, person_list);
    });

  }

  static getAllPersons(callback){
    var personDbInst = new PersonDb();
    var isMissing = this.isMissing;
    var isFound = this.isFound;
    personDbInst.getAllPersons(function(err, person_list){
      var missing = person_list.filter(isMissing);
      var found =person_list.filter(isFound);

      // sort by alphabetical order
      missing.sort(function(a,b){
        return a.firstName.localeCompare(b.firstName);
      });

      found.sort(function(a,b){
        return a.firstName.localeCompare(b.firstName);
      });

      person_list = missing.concat(found);

      callback(err,person_list);
    });
  }

  static changeStatus(personId, foundByUser, callback){
    var personDbInst = new PersonDb();
    personDbInst.changeStatus(personId,foundByUser,function(err, person){

      callback(err,person);
    });
  }

  static deletePerson(personId, callback) {
    var personDbInst = new PersonDb();
    personDbInst.deletePerson(personId, function(err){
      callback(err);

     });

  }

  static samePersonExists(firstName,lastName,age, callback) {
    var personDbInst = new PersonDb();
    personDbInst.samePersonExists(firstName,lastName,age, function(err,person){
      callback(err, person);
     });

  }


}
module.exports = Person;
