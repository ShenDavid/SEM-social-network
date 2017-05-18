var responders = [];
var chiefs = [];
var organization = [];
var dict = {};
var vehicles = [];
var totalVehiclesDict = {};
var allocatedVehiclesDict = {};

$('document').ready(function() {

    loadData();

});

function loadData() {
    $.ajax({
        type: "GET",
        url: '/organization',
        contentType: 'application/json',
        statusCode: {
            200: function(data) {
                responders = data.responders;
                chiefs = data.chiefs;
                organization = data.organization;
                for (var i in organization) {
                    console.log(organization[i]);
                    var resp = organization[i].responderName;
                    dict[resp] = organization[i].chiefName;
                }
                console.log(dict);
                vehicles = data.vehicle;
                console.log(vehicles);
                for (var i in vehicles) {
                    totalVehiclesDict[vehicles[i].chiefName] = vehicles[i].total;
                    allocatedVehiclesDict[vehicles[i].chiefName] = vehicles[i].allocated;
                }
                displayResponders();
                displayChiefs();
            }
        }
    });
};

function displayResponders() {
    var html = '<li class="list-group-item lightBlueBackground">Responders</li>';
    for (var i in responders) {
        var responderName = responders[i].username;
        if (dict[responderName] === undefined) {
            html += '<li class="list-group-item">' + responderName + '</li>';
        }
    }
    $('#responderList').html(html);
};

function displayChiefs() {
    var html = '';
    for (var i in chiefs) {
        var chief = chiefs[i];
        var type = chief.type;
        var title = (type === 4 || type === 14) ? 'CP. ' : 'CF. ';
        var vehicleType = (type === 4 || type === 14) ? '<span class="fa fa-taxi"></span>' : '<span class="fa fa-truck"></span>';
        var totalVehicles = 0;
        if (totalVehiclesDict[chief.username] !== undefined) {
            totalVehicles = totalVehiclesDict[chief.username];
        }
        else {
            totalVehiclesDict[chief.username] = 0;
            allocatedVehiclesDict[chief.username] = 0;
        }
        var responderItems = '<ul style="padding: 0; list-style-type: none">';

        for (var responderName in dict) {
            var chiefName = dict[responderName];
            if (chiefName === chief.username) {
                responderItems += '<li responder="' + responderName + '"><div class="row">' +
                    '<div class="col-sm-11 col-xs-9">' + responderName + '</div>' +
                    '<div class="col-sm-1 col-xs-2"><button type="button" class="btn btn-xs btn-primary btn-unassign"><span class="glyphicon glyphicon-remove"></span></button></div>' +
                    '</div></li>';
            }
        }
        var responderItems = responderItems + '</ul>';

        var responderList = '';
        for (var i in responders) {

            var resp = responders[i].username;
            //console.log(resp);
            var isSameDepartment = (type%10 == (responders[i].type%10 - 1));
            var isMedicToPoliceChief = (type%10 == 4 ) && (responders[i].type%10 == 8);
            if (dict[resp] === undefined && (isSameDepartment || isMedicToPoliceChief)) {
                console.log(resp);
                responderList += '<li><a href="#">' + resp + '</a></li>';
            }
        }

        var updateVehicles = '<div class="btn-group" role="group">' +
            '<button type="button" class="btn btn-primary" id="decrement" chiefName="' + chief.username + '">-</button>' +
            '<button type="button" class="btn btn-secondary" id="increment" chiefName="' + chief.username + '">+</button> </div>';

        var add = '<div class="dropdown"> <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">' +
            'Add <span class="caret"></span></button>' +
            '<ul class="dropdown-menu" chief="' + chief.username + '">' + responderList + '</ul></div>';


        html +=
            '<div class="panel panel-primary" value="name"><div class="panel-heading">' +
            '<div class="row"><div class="col-sm-8 col-xs-8">' + title + chief.username + '</div><div class="col-sm-4 col-xs-4">' + vehicleType + ' ' + totalVehicles + '</div></div></div>' +
            '<div class="panel-body">' + responderItems + '</div>' +
            '<div class="panel-footer"><div class="row"><div class="col-sm-8 col-xs-7">' + add + '</div><div class="col-sm-4 col-xs-5">' + updateVehicles + '</div></div>' +
            '</div><br>';
        //$('#chiefList').append(html);

    }
    $('#chiefList').html(html);
};

function submitChange() {
    var data;
    var vehicleData = [];
    var organizationData = [];

    for (var chiefName in  totalVehiclesDict) {
        var total = totalVehiclesDict[chiefName];
        var allocated = allocatedVehiclesDict[chiefName];
        var v = {
            chiefName: chiefName,
            total: total,
            allocated: allocated
        }
        vehicleData.push(v);
    }

    for (var responderName in dict) {
        var chiefName = dict[responderName];
        var organization = {
            responderName: responderName,
            chiefName: chiefName,
            organizationType: 0
        }
        organizationData.push(organization);
    }

    data = {
        organization: organizationData,
        vehicle: vehicleData
    };

    data = JSON.stringify(data);
    console.log(data);
    $.ajax({
        type: "POST",
        url: '/organization',
        contentType: 'application/json',
        data: data,
        statusCode: {
            200: function(data) {
                window.location.reload(true);
            }
        }
    });
};

function cancelChange() {
    window.location.reload(true);
};

$(document).on('click', 'ul li a', function() {
    var responderName = $(this).text();
    var chiefName = $(this).parent().parent().attr('chief');
    dict[responderName] = chiefName;
    displayResponders();
    displayChiefs();
});

$(document).on('click', '.btn-unassign', function() {
    var responderName = $(this).parents('li').attr('responder');
    delete dict[responderName];
    displayResponders();
    displayChiefs();
});

$(document).on('click', '#decrement', function() {
    var chiefName = $(this).attr('chiefName');
    if (totalVehiclesDict[chiefName] > allocatedVehiclesDict[chiefName]) {
        totalVehiclesDict[chiefName] = totalVehiclesDict[chiefName] - 1;
        displayChiefs();
    }
});

$(document).on('click', '#increment', function() {
    var chiefName = $(this).attr('chiefName');
    totalVehiclesDict[chiefName] = totalVehiclesDict[chiefName] + 1;
    displayChiefs();
});
