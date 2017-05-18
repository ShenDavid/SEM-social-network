"use strict";

var Promise = require("bluebird");
var Item = require("../models/item");
var Organization = require("../models/organization");
var config = require("../config");

//Legacy code does not use promises
var Db = require('../db/db');
var User = require('../models/user');

exports.getInventory = function(req, res, next){
  var user = req.session.user;
  console.log(user);
  if(!req.session.username || ( user.type != 6 && user.type != 7 && user.type != 6)){
    res.redirect(302, '/');
  } else {
    //need to find organization this person is in
    Organization.getChiefName(req.session.username)
    .then(org_list => {
      console.log(org_list);
      if(org_list.length)
        return Item.getItemsByChief(org_list[0].chiefName);
      else
        return [];
    }).then(items => {
      res.render('inventoryDirectory', {
        user: req.session.user,
        username: req.session.username,
        item_list: items,
        requiresBottomNav: true,
        nav_title: "Manage Inventory"
      });
    }).catch(err => {
      console.log("Error retrieving manage_inventory directory.");
      console.log(err);
      res.status(500).send(err);
    });
  }
}

exports.getItemForm = function(req, res, next){
  if(!req.session.username){
    res.redirect(302, '/');
  } else {
    res.render('itemProfile',{
      user: req.session.user,
      username: req.session.username,
      deleteButton: false,
      requiresBottomNav: true,
      nav_title: "Add New Item"
    });
  }
}

exports.postItem = function(req, res, next){
  var item = req.body;
  Organization.getChiefName(req.session.username)
  .then(org_list => {
    console.log(org_list);
    if(org_list.length) {
      item.firechiefName = org_list[0].chiefName;
      return Item.createItem(item);
    } else {
      return null;
    }
  }).then(item => {
    if(item)
      res.status(201).send();
    else
      res.status(404).send();
  }).catch(err => {
    console.log("Error creating a new item.");
    console.log(err);
    res.status(500).send(err);
  });
};

exports.getItem = function(req, res, next){
  if(!req.session.username){
    res.redirect(302, '/');
  } else {
    var itemId = req.params.itemId;
    console.log(itemId);
    Item.getItemById(itemId).then(item => {
      res.render('itemProfile',{
        user: req.session.user,
        username: req.session.username,
        item: item,
        deleteButton: true,
        requiresBottomNav: true,
        nav_title: "Edit Item"
      });
    }).catch(err => {
      console.log("Error retrieving item.");
      console.log(err);
      res.status(500).send(err);
    });
  }
}

exports.updateItem = function(req, res, next){
  if(!req.session.username){
    res.redirect(302, '/');
  } else {
    var item = req.body;

    Item.updateItem(item).then(item => {
      res.status(200).send();
    }).catch(err => {
      console.log("Error updating item.");
      console.log(err);
      res.status(500).send(err);
    });
  }
}

exports.getUserCheckoutItem = function(req, res, next) {
    if(!req.session.username){
        res.redirect(302, '/');
    } else {

      var userId = req.session.user._id;
      console.log(userId);
      Item.getCheckedOutItems(userId).then(function(items) {
        res.render('checkedOutInventory', {
          user: req.session.user,
          username: req.session.username,
          item_list: items,
          requiresBottomNav: true,
          nav_title: "Checkout Inventory"
        })
      }).catch(function(err){
          console.log("Error retrieving user checkout directory.");
          console.log(err);
          res.status(500).send(err);
      });
    }
};

exports.checkInItem = function(req, res, next) {
    if(!req.session.username){
        res.redirect(302, '/');
    } else {
        var userId = req.session.user._id;
        var itemId = req.params.item_id;
        var username = req.params.username;
        console.log(userId);
        console.log(itemId);
        Item.checkInItem(itemId).then(function(result) {
            console.log(result);
            res.redirect('/inventory/'+username);
        }).catch(function(err){
            console.log("Error retrieving user checkout directory.");
            console.log(err);
            res.status(500).send(err);
        });
    }
};

exports.consumeItem = function(req, res, next) {
  if(!req.session.username){
    res.redirect(302, '/');
  } else {
    var itemId = req.params.item_id;
    var username = req.params.username;
    console.log(itemId);
    console.log(username);
    Item.deleteItem(itemId).then(function(result) {
      console.log(result);
      res.redirect('/inventory/'+username);
    }).catch(function(err) {
      console.log(err);
      res.status(500).send(err);
    });
  }
};

exports.checkout = function(req,res, next){
  if(!req.session.username){
        res.redirect(302, '/');
    } else {
        var userId = req.session.user._id;
        var itemId = req.params.item_id;
        var username = req.params.username;
        console.log(userId);
        console.log(itemId);
        Item.checkout(userId, itemId).then(function(result) {
            console.log(result);
            console.log("item checked out");
            res.status(200).send();
        }).catch(function(err){
            console.log(err);
            res.status(500).send(err);
        });
    }
};

exports.delete = function(req, res, next) {
	if(!req.session.username) {
		res.redirect(302, '/');
	}
	else {
		var itemId = req.params.item_id;
		Item.deleteItem(itemId).then(function(result) {
			console.log(result);
			console.log("item deleted");
			res.status(200).send();
		}).catch(function(err) {
			console.log(err);
			res.status(500).send(err);
		});
	}
};
