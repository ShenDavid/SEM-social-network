function enterSend(event){    // press enter to directly send message
	if (event.keyCode === 13){
		verifyMsg();
	}
}

function getPrefix(userType) {
	switch (userType % 10) {
		case 0:
		case 1:
		case 2:
			return "";
		case 3:
			return "D.";
		case 4:
	    	return "CP.";
	    case 5:
	    	return "P.";
	    case 6:
	    	return "FC.";
	    case 7:
	    	return "F.";
	    case 8:
	    	return "M.";
	    case 9:
	    	return "N.";
	}
}

function verifyMsg() {
	var username = document.getElementById("username").innerHTML;
	var userType = document.getElementById("userType").innerHTML;
	var msg = document.getElementById("msgIn").value;

	if (msg !== "") {
		//if there is no error, send data to server to either log in or create new user
		geoFindMe();
		var dd1 = new Date();
	  	var n = dd1.toISOString();
	  	var nonlyDate = n.slice(0,10);
	  	var nonlyTime = n.slice(11,16);
	  	var newDate = nonlyDate +" "+ nonlyTime;
	
		getCityName().then(function(){
			$.ajax({
			    url: "/messages/announcements",
			    data: {
			    	annData : msg,
			      	author : getPrefix(userType) + username,
			      	postedAt : newDate,
			      	latitude : window.latitude,
			      	longitude : window.longitude,
			      	city : window.city
			    },
			    type : "POST",
			    dataType : "json",
			    statusCode: {
			    	201: function() {
			    		console.log("Announcement sent.");
					},
			        403: function() {
			            console.log("Not permitted to post announcement.");
			        },
			        404: function() {
			        	console.log("Error");
			        }
				},
				success: function () {
			  	    console.log("Ajax success");
				},
				error: function(error){
					console.log("Ajax error");
				}
			});
			  	
			$("#msgIn").val("");
		});
	}
}

function msgAppend(msg_list, name, time, content, city, pin) {
	var html = "<div class='bubble-box'><table>"+
        "<tr>" +
          	"<td class='bubble-name'>" + name + "</td>" +
          	"<td class='bubble-time'>" + time + "</td>" +
        "</tr></table>" +
        "<table class='msg-bubble'><tr>" +
          	"<td class='bubble-content' colspan='2'>" + content + "</td>" +
          	"<td class='bubble-time'>" + city +
          	"</td>" +
		"</tr>";


	if (user.type === 1 || user.type === 4 || user.type === 6 || user.type > 10) {
		html +=
			"<tr>" +
				"<td class='bubble-content' colspan='2'></td>" +
		        "<td class='bubble-time'>" +
		        	"<a class='btn btn-primary' onclick='pinAnnouncement('" + content + "', '" + name + "')'>" +
		        		"<span class='fa fa-thumb-tack' style='color:white'></span>" +
		        	"</a>" +
	        	"</td>" +
			"</tr>";
	}
	
	html += "</table>" +
		"</div>";
	
	msg_list.append(html);
}

function scrollbarToBottom(){
	var div = document.getElementById("msg-list");
	div.scrollTop = div.scrollHeight;
}

socket.on('broadcast_announcement', function(ann){
	var dd1 = new Date();
	var n = dd1.toISOString();
	var nonlyDate = n.slice(0,10);
	var nonlyTime = n.slice(11,16);
	var newDate = nonlyDate +" "+ nonlyTime;
	msgAppend($('.msg-list'), ann.author, newDate, ann.annData, ann.city, ann.pin);
	scrollbarToBottom();	// Added this to keep the scrollbar at bottom after sending a message. -Pengcheng
});

function geoFindMe(){
	function success(position){
		window.latitude = position.coords.latitude;
		window.longitude = position.coords.longitude;
	};
	
	navigator.geolocation.getCurrentPosition(success);
}

function getCityName(){
	var geocodingAPI = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + window.latitude + "," + window.longitude;
  
  	return $.getJSON(geocodingAPI, function (json) {
  		if (json.status === "OK") {
  			//Check result 0
  			var result = json.results[0];
         
  			for (var i = 0, len = result.address_components.length; i < len; i++) {
  				var ac = result.address_components[i];
            
	         	if (ac.types.indexOf("locality") >= 0){
	            	window.city = ac.short_name;
	            	
	            	break;
	            }
  			}
     	}
  	});
}

window.onload = function scrollToBottom(){
	scrollbarToBottom();
	var warning;
	
	if (document.getElementsByTagName("p2") !== null && document.getElementsByTagName("p2").length > 0) {
		warning = document.getElementsByTagName("p2")[0].innerHTML;
	}

	if(warning === "You have unread messages."){
		$('#notify').addClass("notify");
    	$("#notify_message").addClass("notify");
    	$('#hamburger').addClass("notify");
	}
	
	geoFindMe();
}

function pinAnnouncement(annData, author){
	var data = {
		annData: annData,
		author: author
	}

    $.ajax({
        url: '/messages/pinAnnouncement',
        data: JSON.stringify(data),
        type : 'POST',
        contentType : 'application/json',
        statusCode: {
	        error: function(error){
	            console.log('error in ajax: ' + error);
	        }
        }
    });

    window.location.reload();
}

function unpinAnnouncement(annData, author){
	var data = {
		annData: annData,
		author: author
	}

    $.ajax({
        url: '/messages/unpinAnnouncement',
        data: JSON.stringify(data),
        type : 'POST',
        contentType : 'application/json',
        statusCode: {
	        error: function(error){
	            console.log('error in ajax: ' + error);
	        }
        }
    });

    window.location.reload();
}

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Announcements</a>");
});