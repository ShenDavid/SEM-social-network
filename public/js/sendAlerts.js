//FIXME: 
function sendAlert(groupName, alertClass) {
	console.log("Sending Alert");
	$.ajax({
		type: "POST",
		url: "/alerts/newAlert",
		data: {
			groupName: groupName,
			alertClass: alertClass
		},
		dataType: "json"
	});

	window.location.href="/messages/groups/"+groupName;

}
//FIXME: END 

var socket = io();

//FIXME: 
socket.on('new_Alert', function(originUser, groupName, alertClass) {
	console.log("Received Alert");
	me = document.getElementById("author").innerHTML;
	if(me != originUser){
	$.ajax({
	        url: '/groups/userInGroups/' +me,
	        type : 'GET',
	        contentType : 'application/json',
	        statusCode: {
		        200: function(data) {
		       		console.log(data);
		       		console.log("executing if");
		       		for(var i in data){
		       		if(data[i].groupName == groupName)
		       			window.location.href="/alerts/incomingAlert/"+groupName+"/"+alertClass;
		       	}
		        },
		        error: function(error){
		            console.log('error in ajax: ' + error);
		        }
	        }
	    });
	}

});
//FIXME: END REMOVE

function returnToGroupDiscussion(groupName) {
  console.log("Redirecting to " + groupName + " discussion page");
  window.location.href = "/messages/groups/"+groupName;
}

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Messages</a>");
});