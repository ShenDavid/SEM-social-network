process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
app = require("../app").app,
server = require("../app").server,
Db = require("../db/db"),
Person = require("../models/person"),
base_url = "http://localhost:8080/";

var db = new Db();
//use conn to hold the connection
var conn;
var person1,person2,person3,person4;
var person1Data, person2Data,person3Data,person4Data;


suite("Missing people", function() {

	suiteSetup("Setup People", function(done){
		person1 = new Person("Bill", "Guo", 22,"San Jose","Ali","Relative");
		person2 = new Person("Adam", "Smith", 45,"Mountain View","Sam","Friend");
		person3 = new Person("John", "Snow", 45,"Mountain View","Sam","Friend");
		person4 = new Person("Jake", "William", 145,"SF","Sam","Friend");

		db.start(function(connection){
			conn = connection;
			person1.savePerson(function(err, person){
				expect(err).to.be(null);
				person1Data = person;
				person2.savePerson(function(err,person){
					expect(err).to.be(null);
					person2Data = person;
					Person.changeStatus(person2Data._id,"newUser",function(err, person){
						expect(err).to.be(null);
						done();
					});
				});
			});

			
		});
	});

	suiteTeardown("Teardown Person", function(done){
		Person.deletePerson(person1Data._id,function(err){
			expect(err).to.be(null);
			Person.deletePerson(person2Data._id, function(err){
				expect(err).to.be(null);
				Person.deletePerson(person3Data._id, function(err){
					expect(err).to.be(null);
					Person.deletePerson(person4Data._id, function(err){
						expect(err).to.be(null);					
						db.close(conn, function(ret){
							done();
						});
					});
				});
			});

		});
	});

	test("Change person status", function(done) {
		Person.changeStatus(person1Data._id,"newUser",function(err, person){
			expect(err).to.be(null);
			expect(person.firstName).to.be("Bill");
			expect(person.status).to.be("Found");
			expect(person.foundBy).to.be("newUser");
			done();
		});

	});

	test("Save person successfully", function(done) {

		person3.savePerson(function(err, person){
			expect(err).to.be(null);
			expect(person.firstName).to.be("John");
			expect(person.lastName).to.be("Snow");
			expect(person.status).to.be("Missing");
			expect(person.age).to.be(45);
			expect(person.location).to.be("Mountain View");
			person3Data = person;
			done();
		});

	});

	test("Check validity of person info - all fields correct", function(done) {
		var firstName = "Ali";
		var lastName = "Khan";
		var age = 40;
		var location = "MountainView";
		var relationship = "Friend";
		Person.isValidData(firstName, lastName, age, location, relationship, function(success){
			expect(success).to.be(true);
			done();
		});

	});

	test("Check validity of person info - NaN age", function(done) {
		var firstName = "Ali";
		var lastName = "Khan";
		var age = "NotANumber";
		var location = "MountainView";
		var relationship = "Friend";
		Person.isValidData(firstName, lastName, age, location, relationship, function(success){
			expect(success).to.be(false);
			done();
		});

	});

	test("Check validity of person info - empty firstName", function(done) {
		var firstName = "";
		var lastName = "Khan";
		var age = 22;
		var location = "San Jose";
		var relationship = "Friend";
		Person.isValidData(firstName, lastName, age, location, relationship, function(success){
			expect(success).to.be(false);
			done();
		});

	});
	test("Check validity of person info - empty lastName", function(done) {
		var firstName = "auser";
		var lastName = "";
		var age = 22;
		var location = "";
		var relationship = "Friend";
		Person.isValidData(firstName, lastName, age, location, relationship, function(success){
			expect(success).to.be(false);
			done();
		});

	});
	test("Check validity of person info - empty location", function(done) {
		var firstName = "auser";
		var lastName = "lastnamee";
		var age = 22;
		var location = "";
		var relationship = "Friend";
		Person.isValidData(firstName, lastName, age, location, relationship, function(success){
			expect(success).to.be(false);
			done();
		});

	});

	test("Check validity of person info - empty relationship", function(done) {
		var firstName = "auser";
		var lastName = "lastnamee";
		var age = 22;
		var location = "SF";
		var relationship = "";
		Person.isValidData(firstName, lastName, age, location, relationship, function(success){
			expect(success).to.be(false);
			done();
		});

	});

	test("Search for existing person by firstName", function(done) {
		var firstName = "John";
		Person.getMatchingPersons(firstName, function(err, person_list){
			expect(err).to.be(null);
			expect(person_list.length).to.be(1);
			var person = person_list[0];
			expect(person.firstName).to.be("John");
			expect(person.lastName).to.be("Snow");
			expect(person.status).to.be("Missing");
			expect(person.age).to.be(45);
			expect(person.location).to.be("Mountain View");
			done();
		});

	});

	test("Search for existing person by lastName", function(done) {
		var lastName = "Snow";
		Person.getMatchingPersons(lastName, function(err, person_list){
			expect(err).to.be(null);
			expect(person_list.length).to.be(1);
			var person = person_list[0];
			expect(person.firstName).to.be("John");
			expect(person.lastName).to.be("Snow");
			expect(person.status).to.be("Missing");
			expect(person.age).to.be(45);
			expect(person.location).to.be("Mountain View");
			done();
		});

	});

	test("Same person already exists ", function(done) {
		var firstName = "John";
		Person.samePersonExists("John","Snow",45 ,function(err, person){
			expect(err).to.be(null);
			expect(person.firstName).to.be("John");
			expect(person.lastName).to.be("Snow");
			expect(person.status).to.be("Missing");
			expect(person.age).to.be(45);
			expect(person.location).to.be("Mountain View");
			done();
		});

	});

	test("Same person doesn't already exists ", function(done) {
		var firstName = "John";
		Person.samePersonExists("notJohn","Snow",45 ,function(err, person){
			expect(err).to.be(null);
			expect(person).to.be(null)
			done();
		});

	});

	test("Check if getting all people works increments after a new person", function(done) {
		var initialLen, finalLen;
		Person.getAllPersons(function(err, person_list){
			expect(err).to.be(null);
			initialLen = person_list.length;
			//add another person
			person4.savePerson(function(err,person){
				expect(err).to.be(null);
				person4Data = person;
				Person.getAllPersons(function(err, person_list){
					expect(err).to.be(null);
					finalLen = person_list.length;
					expect(finalLen).to.be(initialLen+1);
					done();
				});

			});
		});

	});


	// test("Add Item", function(done) {
	// 	foodItem.saveItem(function(err, newItem){
	// 		expect(err).to.be(null);
	// 		expect(newItem.owner).to.be("user1");
	// 		expect(newItem.description).to.be("burger");
	// 		done();
	// 	});
	// });

	// test("Get a user's item", function(done) {
	// 	Item.getUserItems("user2",function(success, item_list){
	// 		expect(success).to.be(true);
	// 		expect(item_list[0].owner).to.be("user2");
	// 		expect(item_list[0].description).to.be("tent");
	// 		expect(item_list[0].category).to.be("Shelter");
	// 		done();
	// 	});
	// });

	// test("Get a shelter item donated by someone else", function(done) {
	// 	Item.getCategoryItems("user1","Shelter",function(success, item_list){
	// 		expect(success).to.be(true);
	// 		expect(item_list[0].owner).to.be("user2");
	// 		expect(item_list[0].description).to.be("tent");
	// 		expect(item_list[0].category).to.be("Shelter");
	// 		done();
	// 	});
	// });
	// //test
	// test("Get items for a category which do not exist", function(done) {
	// 	Item.getCategoryItems("user1","Electronics", function(success, item_list){
	// 		expect(success).to.be(true);
	// 		expect(item_list).to.be(null);
	// 		done();
	// 	});
	// });
});
