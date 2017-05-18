var socket = io();

function addMissingPerson() {
	console.log("adding new person.");
	var relationship = $('#relationship').val();
	var firstName = document.getElementById("firstName").value;
	var lastName = document.getElementById("lastName").value;
	var age = document.getElementById("age").value;
	var location = document.getElementById("location").value;

	console.log("FirstName : " + firstName);
	console.log("LastName : " + lastName);
	console.log("age : " + age);
	console.log("location : " + location);
	console.log("relationship : " + relationship);

	if(isNaN(age)){
		document.getElementById("invalidInput").innerText = "Age needs to be a number";
	}
    else if (firstName ==="" || lastName === "" || age === "" || location === ""){
		document.getElementById("invalidInput").innerText = "You need to enter all fields";
	}

	else {
		console.log("making ajax call");
      document.getElementById("invalidInput").innerText = "";
		$.ajax({
		    url: "/missingPeople/"+username,
		    data: {
		      firstName : firstName,
		      lastName : lastName,
		      age : age,
		      location : location,
		      relationship : relationship,
		    },
		    type : "POST",
		    dataType : "json",
		    statusCode: {
					404: function() {
						console.log("Person could not be added.");
		      	},
					422: function() {
						$("#invalidInput").text(firstName + " " + lastName + " (" + age + ") has already been reported missing!");
					},
					201: function(data) {
						console.log("person has been added with id " + data.person._id);
					},
					401: function(data) {
						console.log("invalid fields");
					},
					success: function () {
		        console.log("Item Ajax success");
		      },
		      error: function(error){
		        console.log("Item Ajax error");
		      }
			}
		});
	}
}

function reportFound(personId) {
	var url = "missingPeople/changeStatus/"+username;
	$.ajax({
		url: url,
		data: {
			personId:personId
		},
		type: "POST",
		dataType: "json",
		statusCode: {
			201: function(data) {
			}
		}
	});
}

socket.on("addedNewMissingPerson", function(person) {
	var nameString = "<p>"+person.firstName + " " + person.lastName + " (" + person.age + ")</p>";
	var location = "<p>"+person.location+"</p>";
	var reporterString = "<p>"+person.reporter + " (" + person.relationship + ")</p>";
	var statusElem = "<p>Missing</p><button id='found"+person._id+"' class='btn-success btn-xs' title='Click if Found' onclick=\"reportFound(\'"+person._id+"\')\">"+"Found?</button>";

	$("#peopleTable").prepend(
		"<tr id=\""+person._id+"\">" +
			"<td id=\"name"+person._id+"\">" + nameString + "</td>" +
			"<td id=\"location"+person._id+"\">" + location + "</td>" +
			"<td id=\"reporter"+person._id+"\">" + reporterString + "</td>" +
			"<td id=\"status"+person._id+"\">" + statusElem + "</td>" +
		"</tr>"
	);
});

socket.on("foundMissingPerson", function(person) {
	var foundByString = "<p>Found by <a id=\"chatWith"+person.foundBy+"\" href=\"/messages/private/"+username+"/"+person.foundBy+"\" title=\"Chat with "+person.foundBy+"\">"+person.foundBy+"</a></p>";
	$("#status"+person._id).html(foundByString);
});

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Missing People</a>");
});