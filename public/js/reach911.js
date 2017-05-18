/**
 * Created by sxh on 17/3/18.
 */

var map;
var emergency;
var dispatcher;
var lat;
var lng;

function geoFindMe() {
    create911Group(
        assignDispatcher(
            //send911Message(
            GMaps.geolocate({
                success: function (position) {
                    map.setCenter(position.coords.latitude, position.coords.longitude);
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                    map.addMarker({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        title: 'me',
                        infoWindow: {
                            content: '<p>I AM HERE!</p>'
                        }
                    });
                },
                error: function (error) {
                    console.log('Geolocation failed: ' + error.message);
                },
                not_supported: function () {
                    console.log("Your browser does not support geolocation");
                },
                always: function () {
                    console.log("Done!");
                }
            })
        )
        //)
    );

}

function send911Message(){
    var dd1 = new Date();
    var n = dd1.toISOString();
    var nonlyDate = n.slice(0,10);
    var nonlyTime = n.slice(11,19);
    var newDate = nonlyDate +" "+ nonlyTime;
    $.ajax({
        url: "/messages/public",
        data: JSON.stringify({
            messageData: "Hello, a dispatcher will be with you shortly.Please provide additional info here",
            author: dispatcher,
            receiver: "IC-" + username,
            postedAt: newDate,
            messageType: 0,
            latitude: null,
            longitude: null,
            city: null,
            attachment: null
        }),
        type: "POST",
        contentType: 'application/json',
        dataType: "json",
        async: false,
        statusCode: {
            201: function () {
                console.log("Message sent.");
                // window.location.href = "/home";

            },
            404: function () {
                console.log("Error");
                // window.location.href = "/home";
            }
        },
        success: function () {
            console.log("Ajax success");
            // uploadedFile = null;
        },
        error: function (error) {
            console.log("Ajax error");
        }
    });
}

function SortCount(a, b){
    return a["count"] - b["count"];
}

function assignDispatcher(){
    $.ajax({
        url: "/reach911/dispatcher",
        type : "GET",
        dataType : "json",
        async: false,
        statusCode: {
            404: function() {
                console.log("Couldn't get some utility category");
            },
            200: function(results) {
                var dispatchers = [];
                var i = 0;
                results.forEach(function(user){
                    if(user.type == 3){
                        var temp_obj = {};
                        temp_obj["uname"] = user.username;
                        $.ajax({
                            url: "/reach911/count/" + user.username,
                            type : "GET",
                            dataType : "json",
                            async: false,
                            statusCode: {
                                200: function(count) {
                                    temp_obj["count"] = count.length;
                                    dispatchers[i++] = temp_obj;
                                },
                                success: function () {
                                    console.log("Ajax success");
                                },
                                error: function(error){
                                    console.log("Ajax error");
                                }
                            }
                        });
                    }
                });

                dispatchers.sort(SortCount);
                dispatcher = dispatchers["0"]["uname"];
                console.log(dispatcher);


                $.ajax({
                    url: "/groups/" + "IC-" + username + "/members/" + dispatcher,
                    data: {
                        groupName: "IC-" + username,
                        memberName: dispatcher
                    },
                    type : "POST",
                    dataType : "json",
                    async: false
                }).done(function(data) {
                    console.log(data);
                    send911Message();

                }).fail(function(XHR) {
                    console.log(XHR);
                });
            },
            success: function () {
                console.log("Ajax success");
            },
            error: function(error){
                console.log("Ajax error");
            }
        }
    });
}

function showAddress() {
    GMaps.geocode({
        address: $('#address').val(),
        callback: function (results, status) {
            if (status == 'OK') {
                var latlng = results[0].geometry.location;
                lat = latlng.lat();
                lng = latlng.lng();
                map.setCenter(latlng.lat(), latlng.lng());
                map.addMarker({
                    lat: latlng.lat(),
                    lng: latlng.lng()
                });
            }
        }
    });
}

function setEmergency(cat) {
    emergency = cat;
    if (cat == "Medical") {
        $(".emergency_panel").hide();
        $("#emergency_medical").show();
    }
    else if (cat == "Fire") {
        $(".emergency_panel").hide();
        $("#emergency_fire").show();
    }
    else if (cat == "Police") {
        $(".emergency_panel").hide();
        $("#emergency_police").show();
    }
}

function create911Group() {
    $.ajax({
        url: "/groups",
        data: {
            groupName: "IC-" + username,
            groupDescription: "For 911 callers " + username
        },
        type: "POST",
        dataType: "json"
    }).done(function (data) {
        console.log(data);
    }).fail(function (XHR) {
        console.log(XHR);
    });
}
function takePhoto(){
    var files = $("#upload")[0].files; 
    if (files[0]){ 
        var data = new FormData(); 
        if (files) {
            var data = new FormData();
            console.log(data);
            console.log("files");
            console.log(files[0]);
        }
    }
}
function sendData() {
    $.ajax({
        url: "/addincident",
        data: {
            address: $('#address').val(),
            longitude: lng.toString(),
            latitude: lat.toString(),
            utilityID: "smdnflwkf",
            category: "incident"
        },
        type: "POST",
        dataType: "json"
    }).done(function (data) {
        console.log(data);
        alert("successfully submit!");
    }).fail(function (XHR) {
        console.log(XHR);
    });

    if (emergency == "Medical") {
        var sex;
        var elements = document.getElementsByName("sex");
        for (var i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                sex = elements[i].value;
                break;
            }
        }

        var Conscient;
        elements = document.getElementsByName("Conscient");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                Conscient = elements[i].value;
                break;
            }
        }

        var isBreath;
        elements = document.getElementsByName("isBreath");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                isBreath = elements[i].value;
                break;
            }
        }

        var isPatient;
        elements = document.getElementsByName("isPatient");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                isPatient = elements[i].value;
                break;
            }
        }

        $.ajax({
            url: "/reach911/patient",
            data: {
                address: $('#address').val(),
                type: emergency,
                dispatcher: dispatcher,
                isPatient: isPatient,
                age: $('#age').val(),
                sex: sex,
                conscient: Conscient,
                breathing: isBreath,
                complaint: $('#complaint').val()
            },
            type: "POST",
            dataType: "json"
        }).done(function (data) {
            console.log(data);
            alert("successfully submit!");

            window.location.href = "/messages/groups/" + "IC-" + username;
        }).fail(function (XHR) {
            console.log(XHR);
        });
    }
    if (emergency == "Fire") {
        var smoke;
        var elements = document.getElementsByName("smoke");
        for (var i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                smoke = elements[i].value;
                break;
            }
        }

        var flame;
        elements = document.getElementsByName("flame");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                flame = elements[i].value;
                break;
            }
        }

        var injury;
        elements = document.getElementsByName("injury");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                injury = elements[i].value;
                break;
            }
        }

        var hmaterial;
        elements = document.getElementsByName("hmaterial");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                hmaterial = elements[i].value;
                break;
            }
        }

        var getout;
        elements = document.getElementsByName("getout");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                getout = elements[i].value;
                break;
            }
        }

        console.log("I want to know dispatcher");
        console.log(dispatcher);

        $.ajax({
            url: "/reach911/save",
            data: {
                address: $('#address').val(),
                smoke: smoke,
                smokecolor: $('#smokecolor').val(),
                type: emergency,
                dispatcher: dispatcher,
                flame: flame,
                smokequantity: $('#smokequantity').val(),
                injury: injury,
                hmaterial: hmaterial,
                getout: getout,
                insidePeople: $('#insidePeople').val(),
                structype: $('#structype').val()
            },
            type: "POST",
            dataType: "json"
        }).done(function (data) {
            console.log(data);

            window.location.href = "/messages/groups/" + "IC-" + username;
        }).fail(function (XHR) {
            console.log(XHR);
            alert("something wrong in submission!");
        });
    }
    if (emergency == "Police") {
        var weapon;
        var elements = document.getElementsByName("weapon");
        for (var i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                weapon = elements[i].value;
                break;
            }
        }

        var injured;
        elements = document.getElementsByName("injured");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                injured = elements[i].value;
                break;
            }
        }

        var left;
        elements = document.getElementsByName("left");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                left = elements[i].value;
                break;
            }
        }

        var safe;
        elements = document.getElementsByName("safe");
        for (i = 0, l = elements.length; i < l; i++) {
            if (elements[i].checked) {
                safe = elements[i].value;
                break;
            }
        }

        $.ajax({
            url: "/reach911/save",
            data: {
                address: $('#address').val(),
                suspect: $('#suspect').val(),
                type: emergency,
                dispatcher: dispatcher,
                injured: injured,
                vehicle: $('#vehicle').val(),
                safe: safe,
                left: left,
                means: $('#means').val(),
                travel: $('#travel').val(),
                detail: $('#detail').val()
            },
            type: "POST",
            dataType: "json"
        }).done(function (data) {
            console.log(data);
            alert("successfully submit!");

            window.location.href = "/messages/groups/" + "IC-" + username;
        }).fail(function (XHR) {
            console.log(XHR);
        });
    }
}

$(document).ready(function () {
    //init
    var lat;
    var lng;
    map = new GMaps({
        el: '#map',
        lat: 37.4104,
        lng: -122.0598
    });

    geoFindMe();

    $("#firstNext").click(function(){
        if(emergency == 'Fire'){
            $('#one').button('toggle');

        }
        else if(emergency == 'Medical'){
            $('#two').button('toggle');

        }
        else if(emergency == 'Police'){
            $('#three').button('toggle');

        }
        $('#myTab li:eq(1) a').tab('show'); // Select third tab (0-indexed)
    });

    $("#secondNext").click(function(){

        if($("#fireoption1").prop("checked")){
            setEmergency("Fire");
            $('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)
        }
        else if($("#medicaloption2").prop("checked")){
            setEmergency("Medical");
            $('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)
        }
        else if($("#policeoption3").prop("checked")){
            setEmergency("Police");
            $('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)
        }
        else{
            alert("Please select an emergency type");
        }


    });

    $("#ToThree").click(function(){

        if($("#fireoption1").prop("checked")){
            setEmergency("Fire");
            $('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)
        }
        else if($("#medicaloption2").prop("checked")){
            setEmergency("Medical");
            $('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)
        }
        else if($("#policeoption3").prop("checked")){
            setEmergency("Police");
            $('#myTab li:eq(2) a').tab('show'); // Select third tab (0-indexed)
        }
        else{
            alert("Please select an emergency type");
        }


    });

    $("#ToTwo").click(function(){

        if(emergency == 'Fire'){
            $('#one').button('toggle');

        }
        else if(emergency == 'Medical'){
            $('#two').button('toggle');

        }
        else if(emergency == 'Police'){
            $('#three').button('toggle');

        }


    });

    $("#fireoption1").click(function(){
        // alert("Fire");
    });

    $("#medicaloption2").click(function(){
        // alert("Medical");
    });

    $("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> 911</a>");
});