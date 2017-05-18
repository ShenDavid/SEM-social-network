process.env.NODE_ENV = 'test';

var request = require("request-promise");
var Promise = require('bluebird');
var CryptoJS = require('crypto-js');
var Db = require("../db/db");
var User = require("../models/user");

var userModel = new User();
var db = new Db();
var base_url = "http://localhost:8080/";

function encrypt(password, salt){
    var key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), { keySize: 256/32, iterations: 1000 }).toString();
    var iv = CryptoJS.lib.WordArray.random(256/8).toString();
    var ciphertext = CryptoJS.AES.encrypt(password, key, {iv: iv}).toString();

    return {key: key, iv: iv, ciphertext: ciphertext};
}

function createNewUser(name, pw, status, type) {
    var newUser = {
        username: name,
        password: pw,
        status: status,
        type: type
    };
    return new Promise(function(resolve, reject) {
        db.start(function(connection){
            userModel.addUser(newUser, function(err){
                if (err) {
                    reject(err);
                } else {
                    db.close(connection, function(err){
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
                }
            });
        });
    });
}

function login(username, password, j, isCreate) {
    if (isCreate === undefined || isCreate === null) {
        isCreate = true;
    }
    return new Promise(function(resolve, reject) {
        request.get(base_url).then((body) => {
            var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
            var salt = body.match(reg)[0].split('"')[2];
            var pw = encrypt(password, salt);
            var postData = {
                username : username,
                ciphertext: pw.ciphertext,
                key : pw.key,
                iv : pw.iv,
                isCreate : isCreate
            };

            var options = {
                method: 'post',
                body: postData,
                json: true,
                url: base_url + "users",
                jar: j
            };

            return request(options);
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
}

function logout(username) {
    return new Promise(function(resolve, reject) {
        db.start(function(connection){
            userModel.deleteUser({username: username}, function(err){
                if (err)
                    reject(err);
                else
                    db.close(connection, function(err) {
                        if (err)
                            reject(err);
                        else
                            resolve();
                    });
            });
        });
    });
}

module.exports = {
    createNewUser: createNewUser,
    login: login,
    logout: logout
};