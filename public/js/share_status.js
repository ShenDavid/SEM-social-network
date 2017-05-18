
//make a post to change status code
//TODO: should we prevent them from changing to a code they are already in?
function changeStatus(status_code) {
	console.log("changingStatus");
    //TODO: get username from html
    var url = "/users/" + username + "/status/" + status_code;
    var statuses = [  "OK", "HELP", "EMERGENCY" ];
    var success_message = document.getElementById("success_message");
    success_message.innerHTML = "";
    console.log(url);
	//if there is no error, send data to server to either log in or create new user
	$.ajax({
    url: "/users/" + username + "/status/" + status_code,
    data: {
      status_code : status_code,
    },
    type : "POST",
    dataType : "json",
    statusCode: {
			404: function() {
				console.log("Status code could not be changed.");
      },
			201: function(data) {
				console.log("Status code has been updated.");
                updateStatusCode(data.statusCode);
                success_message.innerHTML = "Your status has been updated to " + statuses[status_code - 1];
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

//Change current status based on message received
function updateStatusCode(statusCode) {
    var color_class;
    var src;
    //update username status images
    //and hide the current status button
    //turn all dropdown visible for a second

    colors = ["green", "yellow", "red"];
    for( elementCode = 1; elementCode <=3 ; elementCode++ ){
        if( statusCode === elementCode ){
            $('li.shareStatus > a > img.' + colors[elementCode-1]).parent().parent().css("background-color", "darkgrey");
        } else {
            $('li.shareStatus > a > img.' + colors[elementCode-1]).parent().parent().css("background-color", "white" );
        }
    }

    $('li.username > a > img').attr("class", color_class);
    $('li.username > a > img').attr("src", src);
}

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Share Status</a>");
});