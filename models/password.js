/*
* Library for calculating passwords consistently
*/
'use strict';
var crypto = require('crypto');
var CryptoJS = require('crypto-js');

class Password {
  //use this to create salts
  static createRandomString(len){
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    var output = '';
    while(len-- > 0){
      output += characters[Math.floor(Math.random() * characters.length)];
    }
    return output;
  }

  //decrypt the password passed from the client
  static decrypt(ciphertext, key, iv){
    var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), key, {iv: iv});
  	var password = bytes.toString(CryptoJS.enc.Utf8);

    return password;
  }

  //reencrypt the pw using another method so if db is compromised
  //attacker has difficulty decrypting the pw
  //since client side method isn't actually saved
  static createDBPassword(pass){
    var shasum = crypto.createHash('sha256');
    var salt = this.createRandomString(5);
    shasum.update(pass + ":" + salt);
    return shasum.digest('hex') + "|" + salt;
  }

  //check if pw stored inside db is the same as the one sent
  static authenticate(pass, hash){
    if(hash == null)
      return false;

    var hashArr = hash.split("|");
    var shasum = crypto.createHash('sha256');
    if(hashArr.length === 1){
      shasum.update(pass);
      return shasum.digest('hex') === hash;
    } else {
      shasum.update(pass + ":" + hashArr[1]);
      return (shasum.digest('hex')) === hashArr[0];
    }
     return false;
  }
}

module.exports = Password;
