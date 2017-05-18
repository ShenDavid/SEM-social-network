process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require("request-promise");
var bluebird = require('bluebird');

var app = require("../app").app;
var createNewUser = require("./integration_login").createNewUser;
var login = require("./integration_login").login;
var logout = require("./integration_login").logout;
var Item = require("../models/item");
var Organization = require("../models/organization");
var base_url = "http://localhost:8080/";

var j = request.jar();
var orgId;
var itemId;

suite("Integration Tests for Manage Inventory", function() {
  this.timeout(3000);

  suiteSetup(function (done){
    createNewUser("ChiefyMcChiefyFace", "1234", 0, 6)
    .then(() => {
      createNewUser("FirefighterMcFireFace", "1234", 0, 7)
    })
    .then(() => {
      var org = {
          responderName : "FirefighterMcFireFace",
          chiefName : "ChiefyMcChiefyFace",
          organization : 1
      }
      return Organization.addOrganization(org);
    })
    .then(org => {
      expect(org).to.not.be(null);
      orgId = org.id;
      return login("FirefighterMcFireFace", "1234", j, false);
    })
    .then(() => done())
    .catch(err => done(err));
  });

  suiteTeardown(function (done) {
    logout("FirefighterMcFireFace")
    .then(() => {
      return logout("ChiefyMcChiefyFace");
    })
    .then(err => {
      expect(err).to.be(undefined);
      return Organization.deleteOrganization(orgId);
    })
    .then(() => done())
    .catch((err) => done(err))
  });

  test("Access Inventory", function(done){
    var directoryOption = {
      uri: base_url + "inventory",
      method: 'GET',
      jar: j,
      resolveWithFullResponse: true
    };
    request(directoryOption).then(res => {
      expect(res.statusCode).to.be(200);
      console.log(res.body);
      expect(res.body.search("Name")).to.not.be(-1);
      expect(res.body.search("Consumable")).to.not.be(-1);
      expect(res.body.search("My Inventory")).to.not.be(-1);
      done();
    })
    .catch(err => done(err));
  });

  test("My checkout inventory should return 200", function(done) {
      var myInventory = {
          uri: base_url + "inventory/FirefighterMcFireFace",
          method: 'GET',
          jar: j,
          resolveWithFullResponse: true
      };

      request(myInventory).then(res => {
        expect(res.statusCode).to.be(200);
        done();
      })
  });

  test("Post New Item", function(done){
    var profileOption = {
      uri: base_url + "addItem",
      method: 'GET',
      jar: j,
      resolveWithFullResponse: true
    }

    var itemForm = {
      name: "firehose",
      consumable: false
    };

    var formOption = {
      uri: base_url + "addItem",
      method: 'POST',
      jar: j,
      resolveWithFullResponse: true,
      simple: false,
      json: true,
      form: itemForm
    };

    request(profileOption)
    .then(res => {
      expect(res.statusCode).to.be(200);
    })
    .then(() => {
      return request(formOption);
    })
    .then(res => {
      expect(res.statusCode).to.be(201);
      done();
    })
    .catch((err) => done(err));
  });

  test("Update Item", function(done){
    var directoryOption = {
      uri: base_url + "inventory",
      method: 'GET',
      jar: j,
      resolveWithFullResponse: true
    };

    var itemForm = {
      name: "medkit",
      consumable: true
    }

    var formOption = {
      uri: base_url + "item",
      method: 'POST',
      jar: j,
      resolveWithFullResponse: true,
      simple: false,
      json: true
    };

    request(directoryOption)
    .then(res => {
      expect(res.statusCode).to.be(200);
      expect(res.body.search("firehose")).to.not.be(-1);
      return Item.getItemsByChief("ChiefyMcChiefyFace");
    })
    .then(items => {
      itemId = items[0].id
      itemForm.id = itemId;
      formOption.form = itemForm;
      return request(formOption);
    })
    .then(res => {
      expect(res.statusCode).to.be(200);
      return request(directoryOption);
    })
    .then(res => {
      expect(res.statusCode).to.be(200);
      expect(res.body.search("firehose")).to.not.be(1);
      expect(res.body.search("medkit")).to.not.be(-1);
      done();
    })
    .catch(err => done(err));
  });

  test("Checkout Item", function(done){
    var checkinOption = {
       uri: base_url + "inventory/ChiefyMcChiefyFace/"+itemId+"/checkin",
       method: 'GET',
       jar: j,
       resolveWithFullResponse: true,
       json: true
      };
      var checkoutOption = {
       uri: base_url + "item/checkout/" + itemId,
       method: 'POST',
       jar: j,
       resolveWithFullResponse: true,
       json: true
      };
      var checkoutDirectoryOption = {
      uri: base_url + "inventory/ChiefyMcChiefyFace",
      method: 'GET',
      jar: j,
      resolveWithFullResponse: true
    };

    Item.getItemsByChief("ChiefyMcChiefyFace")
    .then(items => {      
      return request(checkoutOption);
    })
    .then(res => {
      expect(res.statusCode).to.be(200);
      return request(checkoutDirectoryOption);

    })
    .then(res => {
      expect(res.statusCode).to.be(200);
      expect(res.body.search("medkit")).to.not.be(-1);
      return request(checkinOption);
    })
    .then(res => {
      expect(res.statusCode).to.be(200);
      done();
    })
    .catch(err => done(err));
  });

  test("Delete Existing Item", function(done) {

	  Item.getItemsByChief("ChiefyMcChiefyFace")
	  .then(items => {
		  var itemIdToDelete = items[0].id;
		  var deleteOption = {
   		 uri: base_url + "item/delete/" + itemIdToDelete,
   		 method: 'POST',
   		 jar: j,
   		 resolveWithFullResponse: true,
			 json: true
   	  };
		  return request(deleteOption);
	  })
	  .then(res => {
		  expect(res.statusCode).to.be(200);
		  done();
	  })
	  .catch(err => done(err));
  });

  test("Delete Non-Existing Item", function(done) {

	  var deleteOption = {
		 uri: base_url + "item/delete/123456abcdefg",
		 method: 'POST',
		 jar: j,
		 resolveWithFullResponse: true,
		 json: true
	  };

	  request(deleteOption)
	  .then(res => {
		  done();
	  })
	  .catch(err => {
		  expect(err.statusCode).to.be(500);
		  expect(true).to.be(err.message.includes("failed"));
		  done();
	  });
  });

});
