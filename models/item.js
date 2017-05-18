'use strict';
var Promise = require('bluebird');

var mongoose = require('../db/connect');
var item = require('../db/schema/item');

var itemModel = mongoose.model('Item', item.itemSchema);

class Item {
  constructor(item){
    this.firechiefName = item.firechiefName;
    this.checkoutBy = item.checkoutBy;
    this.name = item.name;
    this.consumable = item.consumable;
  }

  static getItemById(id){
    return itemModel.findOne({"_id": mongoose.Types.ObjectId(id)});
  }

  static getItemsByChief(username){
    return itemModel.find({"firechiefName": username, "checkoutBy": ""});
  }

  static getCheckedOutItems(id){
    return itemModel.find({"checkoutBy": id});
  }

  static checkInItem(id) {
    return itemModel.findOneAndUpdate({_id: id}, {checkoutBy: ""});
  }

  static changeConsumableStatus(id, consumable) {
      return itemModel.findOneAndUpdate({_id: id}, {consumable: consumable});
  }

  static createItem(item){
    var newItem = new itemModel(item);
    return newItem.save();
  }

  static updateItem(item){
    return itemModel.updateOne({"_id": item.id}, item).exec();
  }

  static deleteItem(id){
    return itemModel.findOneAndRemove({"_id": id}).exec();
  }

  static checkout(userId, itemId){
    return itemModel.findOneAndUpdate({_id: itemId}, {checkoutBy: userId});
  }

}

module.exports = Item;
