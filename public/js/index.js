var prevVehicle;

function exitStatusTable(){
  $(".cancel").remove();
  $(".cancel_icon").remove();
}

$(document).ready(function(){
    if (userType % 10 >= 4 && userType % 10 <= 8 && window.sessionStorage.getItem('online') === null) {
        loadVehicleData();
        window.sessionStorage.setItem('online', true);
    }
    
	$("#backButton").attr("href", "/logout");
    $("#backButton").attr("onclick", "logout()");
});

$(document).on('click', '#switchVehicle', function() {
    var currVehicle =  $('#vehicleID').text();
    var data = {
        prevVehicle: prevVehicle,
        currVehicle: currVehicle
    };

    data = JSON.stringify(data);
    $.ajax({
        type: "POST",
        url: '/vehicleAllocation',
        contentType: 'application/json',
        data: data,
        statusCode: {
            200: function(data) {
                $('#vehicleModal').modal('toggle');
            }
        }
    });
});

$(document).on('click', 'ul li a', function() {
    var vehicleID = $(this).text();
    $('#vehicleID').text(vehicleID);
    document.getElementById('switchVehicle').style.visibility = "visible";
});


function loadVehicleData() {
    $.ajax({
        type: "GET",
        url: '/vehicleAllocationSearch',
        contentType: 'application/json',
        statusCode: {
            200: function (data) {
                var prevVehicle;
                if (data.vehiclesByName.length > 0) {
                    prevVehicle = data.vehiclesByName[0].vehicleID;
                }
                else {
                    prevVehicle = 'None';
                }
                var vehicles = data.vehiclesByType;
                var vehicleList = '';
                for (var i in vehicles) {
                    vehicleList += '<li><a>' + vehicles[i].vehicleID + '</a></li>';
                }
                vehicleList += '<li><a>None</a></li>';
                $('#vehicleList').html(vehicleList);
                $('#vehicleID').text(prevVehicle);
                $("#vehicleModal").modal('show');
            }
        }
    });
}


function logout() {
    window.sessionStorage.removeItem('online');
}
