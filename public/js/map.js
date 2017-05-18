/**
 * Created by sxh on 17/3/12.
 */
var map;
var gmarkers_group = {};
var gmarkers_members = {};
var t_hospital = false;
var t_truck = false;
var t_car = false;
var t_incident = false;
var geocoder = new google.maps.Geocoder;
var addr = {};
var pin_group = {};

var t_groups = {};
var group_arr = groups.split(",");
for(var j = 0; j < group_arr.length; j++){
    t_groups[group_arr[j]] = false;
}

var t_contacts = {};
var contact_arr = contacts.split(",");
for(var i = 0; i < contact_arr.length; i++){
    t_contacts[contact_arr[i]] = false;
}

function geoFindSpecificAddr(latLng){

}
function geoFindMe(){
    $.ajax({
        url: "/map/addData",
        data: {
        },
        type : "POST",
        dataType : "json",
        statusCode: {
            201: function() {
                console.log("Message sent.");
                // window.location.href = "/home";

            },
            404: function() {
                console.log("Error");
                // window.location.href = "/home";
            }
        },
        success: function () {
            console.log("Ajax success");
        },
        error: function(error){
            console.log("Ajax error");
        }
    });
    GMaps.geolocate({
        success: function(position) {
            console.log(position);
            map.setCenter(position.coords.latitude, position.coords.longitude);
            var latlng = {lat: parseFloat(position.coords.latitude), lng: parseFloat(position.coords.longitude)};
            $.ajax({
                url: "/map/userlocation",
                data: {
                    latitude : position.coords.latitude,
                    longitude : position.coords.longitude,
                    address : "***"
                },
                type : "POST",
                dataType : "json",
                statusCode: {
                    201: function() {
                        console.log("Message sent.");
                        // window.location.href = "/home";

                    },
                    404: function() {
                        console.log("Error");
                        // window.location.href = "/home";
                    }
                },
                success: function () {
                    console.log("Ajax success");
                },
                error: function(error){
                    console.log("Ajax error");
                }
            });
            var res_addr = "";
            geocoder.geocode({
                    'location': latlng
                }, function(results, status) {
                console.log(status);
                if (status == google.maps.GeocoderStatus.OK) {
                    res_addr = results[0].formatted_address;
                    marker = map.addMarker({
                        lat: latlng.lat,
                        lng: latlng.lng,
                        title: 'Marker',
                        infoWindow: {
                            content: "Me" + "<br>" + res_addr
                        }
                    });
                }
            });
            // map.addMarker({
            //     lat: position.coords.latitude,
            //     lng: position.coords.longitude,
            //     title: 'me',
            //     infoWindow: {
            //         content: '<p>I AM HERE!</p >'
            //     }
            // });

            $.ajax({
                url: "/map/userlocation",
                data: {
                    latitude : position.coords.latitude,
                    longitude : position.coords.longitude,
                    address : "***"
                },
                type : "POST",
                dataType : "json",
                statusCode: {
                    201: function() {
                        console.log("Message sent.");
                        // window.location.href = "/home";

                    },
                    404: function() {
                        console.log("Error");
                        // window.location.href = "/home";
                    }
                },
                success: function () {
                    console.log("Ajax success");
                },
                error: function(error){
                    console.log("Ajax error");
                }
            });

        },
        error: function(error) {
            console.log('Geolocation failed: '+error.message);
        },
        not_supported: function() {
            console.log("Your browser does not support geolocation");
        },
        always: function() {
            console.log("Done!");
        }
    });
}

function showMembers(group_name){
    console.log("this is group name " + group_name);
    t_groups[group_name] = !(t_groups[group_name]);
    if(t_groups[group_name]) {
        $.ajax({
            url: "/map/members/" + group_name,
            type: "GET",
            dataType: "json",
            statusCode: {
                404: function () {
                    console.log("Couldn't get some utility category");
                },
                200: function (results) {
                    console.log("Received locations of one group");
                    console.log(results);
                    gmarkers_members[group_name] = [];
                    results.forEach(function(user){
                        console.log(user);
                        $.ajax({
                            url: "/map/member/" + user,
                            type: "GET",
                            dataType: "json",
                            async: false,
                            statusCode: {
                                200: function (userloc) {
                                    if(userloc.length > 0) {
                                        console.log(userloc);
                                        var marker = map.addMarker({
                                            icon: "/images/map_icon/hospital.jpeg",
                                            lat: userloc[0].latitude,
                                            lng: userloc[0].longitude,
                                            title: "group member",
                                            infoWindow: {
                                                content: '<p>"group member"!</p >'
                                            }
                                        });
                                        gmarkers_members[group_name].push(marker);
                                        // window.location.href = "/home";
                                    }

                                },
                                404: function () {
                                    console.log("Error");
                                    // window.location.href = "/home";
                                }
                            },
                            success: function () {
                                console.log("Ajax success");
                            },
                            error: function (error) {
                                console.log("Ajax error");
                            }
                        });


                        // gmarkers_group['car'] = [];
                        // for(var i = 0; i < results.length; i++) {
                        //     var marker = map.addMarker({
                        //         icon  : "/images/map_icon/"+ results[i].category +".jpeg",
                        //         lat: results[i].latitude,
                        //         lng: results[i].longitude,
                        //         title: results[i].category,
                        //         infoWindow: {
                        //             content: '<p>"'+ results[i].category +'"!</p >'
                        //         }
                        //     });
                        //     gmarkers_group['car'].push(marker);
                        // }
                    });
                },
                success: function () {
                    console.log("Ajax success");
                },
                error: function (error) {
                    console.log("Ajax error");
                }
            }
        });
    }
    else {
        for(var j = 0; j < gmarkers_members[group_name].length; j++) {
            gmarkers_members[group_name][j].setMap(null);
        }
        gmarkers_members[group_name] = [];
    }
}


function showContacts(contact_name){
    console.log("this is contact name " + contact_name);
    t_contacts[contact_name] = !(t_contacts[contact_name]);
    if(t_contacts[contact_name]){
        $.ajax({
            url: "/map/contact/" + contact_name,
            type : "GET",
            dataType : "json",
            statusCode: {
                404: function() {
                    console.log("Couldn't get some utility category");
                },
                200: function(results) {
                    console.log("Received locations of one contact");
                    console.log(results);
                    gmarkers_group[contact_name] = [];
                    for(var i = 0; i < results.length; i++) {
                        var marker = map.addMarker({
                            icon  : "/images/map_icon/citizen.jpeg",
                            lat: results[i].latitude,
                            lng: results[i].longitude,
                            title: contact_name,
                            infoWindow: {
                                content: '<p>"'+ contact_name +'"!</p >'
                            }
                        });
                        gmarkers_group[contact_name].push(marker);
                    }
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
    else {
        for(var j = 0; j < gmarkers_group[contact_name].length; j++) {
            gmarkers_group[contact_name][j].setMap(null);
        }
        gmarkers_group[contact_name] = [];
    }
}

function showHospitals(){

    console.log("Hospitals!");
    t_hospital = !t_hospital;
    if(t_hospital){
        $.ajax({
            url: "/map/" + "hospital",
            type : "GET",
            dataType : "json",
            statusCode: {
                404: function() {
                    console.log("Couldn't get some utility category");
                },
                200: function(results) {
                    console.log("Received locations of one category");
                    console.log(results);
                    gmarkers_group['hospital'] = [];
                    for(var i = 0; i < results.length; i++) {
                        var marker = map.addMarker({
                            icon  : "/images/map_icon/"+ results[i].category +".jpeg",
                            lat: results[i].latitude,
                            lng: results[i].longitude,
                            title: results[i].category,
                            infoWindow: {
                                content: '<p>"'+ results[i].category +'"!</p >'
                            }
                        });
                        gmarkers_group['hospital'].push(marker);
                    }
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
    else {
        for(var j = 0; j < gmarkers_group['hospital'].length; j++) {
            gmarkers_group['hospital'][j].setMap(null);
        }
        gmarkers_group['hospital'] = [];
    }
};

function showTrucks(){
    t_truck = !t_truck;
    if(t_truck){
        $.ajax({
            url: "/map/" + "truck",
            type : "GET",
            dataType : "json",
            statusCode: {
                404: function() {
                    console.log("Couldn't get some utility category");
                },
                200: function(results) {
                    console.log("Received locations of one category");
                    console.log(results);
                    gmarkers_group['truck'] = [];
                    for(var i = 0; i < results.length; i++) {
                        var marker = map.addMarker({
                            icon  : "/images/map_icon/"+ results[i].category +".jpeg",
                            lat: results[i].latitude,
                            lng: results[i].longitude,
                            title: results[i].category,
                            infoWindow: {
                                content: '<p>"'+ results[i].category +'"!</p >'
                            }
                        });
                        gmarkers_group['truck'].push(marker);
                    }

                    // iterateMarker();

                    // console.log(gmarkers_group);
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
    else {
        for(var j = 0; j < gmarkers_group['truck'].length; j++) {
            gmarkers_group['truck'][j].setMap(null);
        }
        gmarkers_group['truck'] = [];
    }

};

function showIncidents(){
    t_incident = !t_incident;
    if(t_incident){
        $.ajax({
            url: "/map/" + "incident",
            type : "GET",
            dataType : "json",
            statusCode: {
                404: function() {
                    console.log("Couldn't get some utility category");
                },
                200: function(results) {
                    console.log("Received locations of one category");
                    console.log(results);
                    gmarkers_group['incident'] = [];
                    for(var i = 0; i < results.length; i++) {
                        var marker = map.addMarker({
                            icon  : "/images/map_icon/"+ results[i].category +".jpeg",
                            lat: results[i].latitude,
                            lng: results[i].longitude,
                            title: results[i].category,
                            infoWindow: {
                                content: '<p>"'+ results[i].category +'"!</p >'
                            }
                        });
                        gmarkers_group['incident'].push(marker);
                    }
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
    else {
        for(var j = 0; j < gmarkers_group['incident'].length; j++) {
            gmarkers_group['incident'][j].setMap(null);
        }
        gmarkers_group['incident'] = [];
    }

};

function showCars(){
    t_car = !t_car;
    console.log("Cars!");
    if(t_car){
        $.ajax({
            url: "/map/" + "car",
            type : "GET",
            dataType : "json",
            statusCode: {
                404: function() {
                    console.log("Couldn't get some utility category");
                },
                200: function(results) {
                    console.log("Received locations of one category");
                    console.log(results);
                    gmarkers_group['car'] = [];
                    for(var i = 0; i < results.length; i++) {
                        var marker = map.addMarker({
                            icon  : "/images/map_icon/"+ results[i].category +".jpeg",
                            lat: results[i].latitude,
                            lng: results[i].longitude,
                            title: results[i].category,
                            infoWindow: {
                                content: '<p>"'+ results[i].category +'"!</p >'
                            }
                        });
                        gmarkers_group['car'].push(marker);
                    }
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
    else {
        for(var j = 0; j < gmarkers_group['car'].length; j++) {
            gmarkers_group['car'][j].setMap(null);
        }
        gmarkers_group['car'] = [];
    }
};


function showAreas(){

    console.log("Areas!");
    $.ajax({
        url: "/map/" + "area",
        type : "GET",
        dataType : "json",
        statusCode: {
            404: function() {
                console.log("Couldn't get some utility category");
            },
            200: function(results) {
                console.log("Received locations of one category");
                console.log(results);

                for(var i = 0; i < results.length; i++){
                    map.addMarker({
                        icon  : "/images/map_icon/area.jpeg",
                        lat: results[i].latitude,
                        lng: results[i].longitude,
                        title: 'AREA',
                        infoWindow: {
                            content: '<p>AREA!</p >'
                        }
                    });
                }
            },
            success: function () {
                console.log("Ajax success");
            },
            error: function(error){
                console.log("Ajax error");
            }
        }
    });
};

function showBlocks(){

    console.log("Blocks!");
    $.ajax({
        url: "/map/" + "block",
        type : "GET",
        dataType : "json",
        statusCode: {
            404: function() {
                console.log("Couldn't get some utility category");
            },
            200: function(results) {
                console.log("Received locations of one category");
                console.log(results);

                for(var i = 0; i < results.length; i++){
                    map.addMarker({
                        icon  : "/images/map_icon/block.jpeg",
                        lat: results[i].latitude,
                        lng: results[i].longitude,
                        title: 'BLOCKS',
                        infoWindow: {
                            content: '<p>BLOCK!</p >'
                        }
                    });
                }
            },
            success: function () {
                console.log("Ajax success");
            },
            error: function(error){
                console.log("Ajax error");
            }
        }
    });
};



$(document).ready(function(){
    //init
    var lat;
    var lng;
    map = new GMaps({
        el: '#map',
        lat: 37.4104,
        lng: -122.0598,
        click: function(event) {
            $("#myModal").modal('show');
            lat = event.latLng.lat();
            lng = event.latLng.lng();
            console.log("This is click event: " + lat + " " + lng);
        }
    });

    // find my geo location
    geoFindMe();
    var user = JSON.parse(userInMap.replace(/&quot;/g,'"'));
    if(user.type % 10 >= 4 && user.type % 10 <= 8) {
        $("#road_block").show();
    } else{
        $("#road_block").hide();
    }


    //get historical data pin data from the data
    var p_data = JSON.parse(pin_Data.replace(/&quot;/g,'"'));
    console.log(p_data);
    var p_len = p_data.length;
    for(var i = 0; i < p_data.length; i++) {
        var des_arr = p_data[i].desc.split("###");
        var des = des_arr[0];
        var addr_loc = des_arr[1];
        // console.log(p_data[i].lat + p_data[i].lng);
        var marker = map.addMarker({
            lat: p_data[i].lat,
            lng: p_data[i].lng,
            title: 'Marker',
            infoWindow: {
                content : des + "<br>" + addr_loc
            }
        });
        if(!p_data[i].isPin) {
            marker.setIcon("/images/map_icon/roadBlock.jpeg");
        }

        pin_group["" + p_data[i].lat + p_data[i].lng] = marker;
        console.log("" + p_data[i].lat + p_data[i].lng);
        google.maps.event.addListener(marker, "rightclick", function (event) {
            console.log("Double Click");
            var temp_pin = pin_group["" + event.latLng.lat() + event.latLng.lng()];
            console.log(temp_pin);
            temp_pin.setMap(null);

            $.ajax({
                url: "/map/deletePin",
                type : "POST",
                dataType : "json",
                data : {
                    lat : event.latLng.lat(),
                    lng : event.latLng.lng()
                },
                statusCode: {
                    201: function() {
                        // window.location.href = "/home";

                    },
                    404: function() {
                        // window.location.href = "/home";
                    }
                },
                success: function () {
                    console.log("Ajax success");
                },
                error: function(error){
                    console.log("Ajax error");
                }
            });


            delete pin_group["" + event.latLng.lat() + event.latLng.lng()];
        });

    }


    $('#showSide').click(function() {
        $('#sideMenu').toggle();
    });

    $('#success_marker').click(function() {
        var isPin = $("#pin_opt").prop( "checked" );
        var des = $("#message-text").val();
        // console.log(des);
        console.log("" + lat + lng);
        var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
        geocoder.geocode({
            'location': latlng
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    // var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};

                    var marker = map.addMarker({
                        lat: lat,
                        lng: lng,
                        title: 'Marker'
                    });
                    if(!isPin) {
                        marker.setIcon("/images/map_icon/roadBlock.jpeg");
                    }
                    pin_group["" + lat + lng] = marker;
                    google.maps.event.addListener(marker, "rightclick", function (event) {
                        console.log("right Click");
                        console.log("" + event.latLng.lat() + event.latLng.lng());
                        var temp_pin = pin_group["" + event.latLng.lat() + event.latLng.lng()];
                        console.log(temp_pin);
                        console.log(pin_group);
                        temp_pin.setMap(null);

                        $.ajax({
                            url: "/map/deletePin",
                            type : "POST",
                            dataType : "json",
                            data : {
                                lat : event.latLng.lat(),
                                lng : event.latLng.lng()
                            },
                            statusCode: {
                                201: function() {

                                },
                                404: function() {
                                    // window.location.href = "/home";
                                }
                            },
                            success: function () {
                                console.log("Ajax success");
                            },
                            error: function(error){
                                console.log("Ajax error");
                            }
                        });


                        delete pin_group["" + event.latLng.lat() + event.latLng.lng()];
                    });
                    var res_addr =results[0].formatted_address;
                    var infowindow = new google.maps.InfoWindow({
                        content: des + "<br>" + res_addr
                    });
                    google.maps.event.addListener(marker, "click", function (event) {
                        infowindow.open(map, marker);
                    });

                    $.ajax({
                        url: "/map/addPin",
                        type : "POST",
                        dataType : "json",
                        data : {
                            lat : lat,
                            lng : lng,
                            desc : des + "###" + res_addr,
                            isPin : isPin
                        },
                        statusCode: {
                            201: function() {
                                // window.location.href = "/home";

                            },
                            404: function() {
                                // window.location.href = "/home";
                            }
                        },
                        success: function () {
                            console.log("Ajax success");
                        },
                        error: function(error){
                            console.log("Ajax error");
                        }
                    });
                }
            }

        });

        // marker.addListener('click', function (event) {
        //     // var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
        // });

        $("#message-text").val("");

    });
});

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Map</a>");
});