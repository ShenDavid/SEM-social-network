process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var Db = require("../db/db");
var Reach911 = require("../models/Reach911");
var reach911Db = require("../db/interface/Reach911Db");

var db = new Db();

var emergency1 = {};
emergency1.caller = "edian1";
emergency1.address = "carnegie mellon university";
emergency1.dispatcher = "xhs";
emergency1.type = "Medical";
emergency1.isPatient = "Yes";
emergency1.patientlist = [];
var emergency2 = {};
emergency2.caller = "edian2";
emergency2.address = "village lake";
emergency2.dispatcher = "xhs";
emergency2.type = "Fire";
emergency2.smoke = "heavy";
emergency2.smokecolor = "heavy";
emergency2.smokequantity = "heavy";
emergency2.flame = "heavy";
emergency2.injury = "heavy";
emergency2.structype = "heavy";
emergency2.hmaterial = "heavy";
emergency2.insidePeople = "heavy";
emergency2.getout = "heavy";
var emergency3 = {};
emergency3.caller = "edian2";
emergency3.address = "village lake";
emergency3.dispatcher = "xhs";
emergency3.type = "Police";
emergency3.weapon = "heavy";
emergency3.injured = "heavy";
emergency3.suspect = "heavy";
emergency3.vehicle = "heavy";
emergency3.means = "heavy";
emergency3.travel = "heavy";
emergency3.safe = "heavy";
emergency3.left = "heavy";
emergency3.detail = "heavy";

suite("Reach911", function() {
    suiteSetup(function (done) {


        reach911Db = new reach911Db();

        db.start(function(connection){
            conn = connection;
            reach911Db.addAllpage(emergency1,function(err,rs) {
                reach911Db.addAllpage(emergency2,function(err,rs) {
                    reach911Db.addAllpage(emergency3,function(err,rs) {
                        done();
                    });
                });
            });
        });
    });

    suiteTeardown(function (done) {
        reach911Db.deleteByCaller('edian1', function() {
            reach911Db.deleteByCaller('edian2', function() {
                db.close(conn, function (err) {
                    done();
                });
            });
        });
    });

    test("Add Emergency success", function (done) {
        reach911Db.addFirstPage(emergency1,function(err,rs){
            expect(rs.caller).to.be("edian1");
            done();
        });

    });

    test("Get Emergency success", function (done) {
        reach911Db.getByCaller("edian1",function(err,rs){

            expect(rs[0].address).to.be("carnegie mellon university");
            done();
        });

    });

    test("Model: Get Emergency success", function (done) {
        Reach911.getByCaller("edian1",function(rs){

            expect(rs[0].address).to.be("carnegie mellon university");
            done();
        });

    });

    test("get emergency by dispatcher success",function(done){

        reach911Db.getByDispatcher("xhs",function(err,res){
            expect(res[0].dispatcher).to.be("xhs");
            done();
        });
    });

    test("Model: get emergency by dispatcher success",function(done){

        Reach911.findDispatcherByName("xhs",function(err,res){
            expect(res[0].dispatcher).to.be("xhs");
            done();
        });
    });

    test("Add medical all page success", function (done) {
        reach911Db.addAllpage(emergency1,function(err,rs){
            expect(rs.caller).to.be("edian1");
            done();
        });

    });

    test("Model: Add medical all page success", function (done) {
        Reach911.saveByCaller(emergency1,function(rs){
            expect(rs).to.be(true);
            done();
        });

    });

    test("Add fire all page success", function (done) {
        reach911Db.addAllpage(emergency2,function(err,rs){
            expect(rs.caller).to.be("edian2");
            done();
        });

    });

    test("Model: Save return ID success", function (done) {
        Reach911.saveReturnID(emergency2,function(rs){
            expect(rs.caller).to.be("edian2");
            done();
        });

    });

    test("Add police page success", function (done) {
        reach911Db.addAllpage(emergency3,function(err,rs){
            expect(rs.caller).to.be("edian2");
            done();
        });

    });

    test("Model: Add police page success", function (done) {
        Reach911.saveByCaller(emergency3,function(rs){
            expect(rs).to.be(true);
            done();
        });

    });
});
