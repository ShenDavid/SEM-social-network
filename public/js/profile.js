var userToChange;
var userTypeToChange;

function encrypt(password, salt){
    var key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), { keySize: 256/32, iterations: 1000 }).toString();
    var iv = CryptoJS.lib.WordArray.random(256/8).toString();
    var ciphertext = CryptoJS.AES.encrypt(password, key, {iv: iv}).toString();

    return {key: key, iv: iv, ciphertext: ciphertext};
}

function getStatus(code){
    if(code === 1){
        return "Ok";
    }
    else if(code === 2){
        return "Help";
    }
    else if(code === 3){
        return "Emergency";
    }
    else {
        return "Undefined";
    }
}

function getDate(date){
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];

    var date = new Date(date);
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var part1 = day + ' ' + monthNames[monthIndex] + ' ' + year;
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var sec = date.getSeconds();
    var part2 = hour + ':' + minutes + ':' + sec;

    return part1 + ' - ' + part2;
}

function crumbAppend(crumb_list, crumbs){
    crumb_list.css("display","inherit");
    
    for(var i = 0; i < crumbs.length; i++) {
        crumb_list.append(
            "<tr class='status_row'>"+
            "<td>"+getStatus(crumbs[i].statusCode)+"</td>"+
            "<td>"+getDate(crumbs[i].createdAt)+"</td>"+
            "</tr>"
        );
    }
}

function getCrumbs(){
    $('.status_row').each(function(){
        $(this).remove();
    });
    
    $.ajax({
        url: "/users/" + userToChange + "/statusCrumbs",
        type : "GET",
        dataType : "json",
        statusCode: {
            404: function() {
                console.log("Couldn't get statusCrumbs");
            },
            200: function(data) {
                console.log("Received the list of statusCrumbs");
                crumbAppend($(".crumb-list"), data.crumbs);
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

function updateName(){
    var newUsername = document.getElementById("newUsername").value;

    if(newUsername.length >= 3){
        $.ajax({
            url: "/users/"+userToChange,
            data: {
                username : userToChange,
                newUsername : newUsername,
            },
            type : "POST",
            dataType : "json",
            statusCode: {
                422: function(errors) {
                    console.log("Error 422!");
                    var err_list = JSON.parse(errors.responseText).errors;

                    if (err_list.usernameLenInvalid)
                        document.getElementById("usrLabel").innerHTML = "Please choose a different username. Length of username must be at least 3 characters"

                    if (err_list.usernameBanned)
                        document.getElementById("usrLabel").innerHTML = "Please choose a different username. This username is banned"
                },
                200: function() {
                    console.log("username changed");
                    window.location.href = "/users/"+newUsername;
                },
                error: function(error){
                    console.log("error in ajax: " + error);
                }
            }
        });
    }
    else{
        document.getElementById("usrLabel").innerHTML = "Please choose a different username. Length of username must be at least 3 characters"
    }
}

function updatePrivilege(){
    var newPrivilege = -1;
    var content = document.getElementById("priSel").value;

    if(content === "Citizen")
        newPrivilege = 0;
    else if(content === "Administrator")
        newPrivilege = 1;
    else if(content == "Coordinator")
        newPrivilege = 2;
    else if(content === "Dispatcher")
        newPrivilege = 3;
    else if(content === "Police Chief")
        newPrivilege = 4;
    else if(content === "Patrol Officer")
        newPrivilege = 5;
    else if(content === "Fire Chief")
        newPrivilege = 6;
    else if(content === "Firefighter")
        newPrivilege = 7;
    else if(content === "Paramedic")
        newPrivilege = 8;
    else if(content === "Nurse")
        newPrivilege = 9;

    if (newPrivilege !== -1 && content !== "Administrator" && document.getElementById("isCoordinator").checked)
        newPrivilege += 10;

    if(newPrivilege !== -1){
    	if ((userTypeToChange % 10 <= 1) && (newPrivilege % 10 >= 3)) {
    		deleteGroupMember('Public', userToChange);
    		
    		if (newPrivilege < 10 && newPrivilege % 10 !== 0 && newPrivilege % 10 !== 1 && newPrivilege % 10 !== 4 && newPrivilege % 10 !== 6) {
    			deleteGroupMember('Info', userToChange);
    		}
    	}
    	else if ((userTypeToChange % 10 >= 3) && (newPrivilege % 10 <= 1)) {
    		addGroupMember('Public', userToChange);
    		
    		if (newPrivilege > 10 || newPrivilege % 10 !== 0 || newPrivilege % 10 !== 1 || newPrivilege % 10 === 4 || newPrivilege % 10 === 6) {
    			addGroupMember('Info', userToChange);
    		}
    	}
    	
    	if (((userTypeToChange % 10 <= 1) || (userTypeToChange % 10 === 9)) && (newPrivilege % 10 >= 3) && (newPrivilege % 10 !== 9)) {
    		addGroupMember('Responders', userToChange);
    	}
    	else if (((newPrivilege % 10 <= 1) || (newPrivilege % 10 === 9)) && (userTypeToChange % 10 >= 3) && (userTypeToChange % 10 !== 9)) {
    		deleteGroupMember('Responders', userToChange);
    	}
    	
    	if (userTypeToChange % 10 === 3) {
    		deleteGroupMember('Dispatch', userToChange);
    	}
    	else if ((userTypeToChange % 10 === 4) || (userTypeToChange % 10 === 5)) {
    		deleteGroupMember('Police', userToChange);
    	}
    	else if ((userTypeToChange % 10 >= 6) && (userTypeToChange % 10 <= 8)) {
    		deleteGroupMember('Fire', userToChange);
    	}
    	else if (userTypeToChange % 10 >= 4) {
    		deleteGroupMember('Medic', userToChange);
    	}
    	else if (userTypeToChange % 10 === 9) {
    		deleteGroupMember('Nurses', userToChange);
    	}
    	
    	if (newPrivilege % 10 === 3) {
    		addGroupMember('Dispatch', userToChange);
    	}
    	else if ((newPrivilege % 10 === 4) || (newPrivilege % 10 === 5)) {
    		addGroupMember('Police', userToChange);
    	}
    	else if ((newPrivilege % 10 >= 6) && (newPrivilege % 10 <= 8)) {
    		addGroupMember('Fire', userToChange);
    	}
    	else if (newPrivilege % 10 >= 4) {
    		addGroupMember('Medic', userToChange);
    	}
    	else if (newPrivilege % 10 === 9) {
    		addGroupMember('Nurses', userToChange);
    	}
    	
        $.ajax({
            url: "/users/"+userToChange,
            data: {
                username : userToChange,
                newPrivilege : newPrivilege
            },
            type : "POST",
            dataType : "json",
            statusCode: {
                200: function() {
                    console.log("privilege changed");
                    window.location.href = "/administer_users";
                },
                error: function(error){
                    console.log("error in ajax: " + error);
                }
            }
        });
    }
}

function updatePassword(){
    var newPwd = document.getElementById("newPwd").value;

    if(newPwd.length >= 4){
        var salt = document.getElementById("pwdBtn").getAttribute("rel");
        var pw = encrypt(newPwd, salt);

        $.ajax({
            url: "/users/"+userToChange,
            data: {
                username : userToChange,
                ciphertext: pw.ciphertext,
                key : pw.key,
                iv : pw.iv,
            },
            type : "POST",
            dataType : "json",
            statusCode: {
                422: function(errors) {
                    console.log("Error 422!");
                    var err_list = JSON.parse(errors.responseText).errors;

                    if (err_list.passwordLenInvalid)
                        document.getElementById("pwdLabel").innerHTML = "Please choose a different password. Length of password must be at least 4 characters";
                },
                200: function() {
                    console.log("password changed");
                    window.location.href = "/users/"+userToChange;
                },
                500: function(errors) {
                    console.log(errors);
                },
                error: function(error){
                    console.log("error in ajax: " + error);
                }
            }
        });
    }
    else{
        document.getElementById("pwdLabel").innerHTML = "Please choose a different password. Length of password must be at least 4 characters";
    }
}

function activateUser(){
    $.ajax({
        url: "/users/"+userToChange,
        data: {
            username : userToChange,
            wantActivate : 1,
        },
        type : "POST",
        dataType : "json",
        statusCode: {
            200: function() {
                console.log("user activated");
                window.location.href = "/users/"+userToChange;
            },
            error: function(error){
                console.log("error in ajax: " + error);
            }
        }
    });
}

function deactivateUser(){
    $.ajax({
        url: "/users/"+userToChange,
        data: {
            username : userToChange,
            wantDeactivate : 1,
        },
        type : "POST",
        dataType : "json",
        statusCode: {
            200: function() {
                console.log("user deactivated");
                window.location.href = "/users/"+userToChange;
            },
            error: function(error){
                console.log("error in ajax: " + error);
            }
        }
    });
}

function checkCoordinator(){
    var content = document.getElementById("priSel").value;

    if (content==="Administrator") {
        document.getElementById("coordinatorLabel").hidden = true;
    }
    else {
        document.getElementById("coordinatorLabel").hidden = false;
    }
}

function changeUser(i){
    userToChange = user_list[i].username;
    userTypeToChange = user_list[i].type;

    //show username
    $("#usrLabel").text("Username: " + user_list[i].username);
    //show account status
    if(user_list[i].accountStatus === 0){
        $("#acctStatus").text("Account Status: Active");
        $("#acctStatus").attr("onclick", "deactivateUser()");
    }
    else {
        $("#acctStatus").text("Account Status: Inactive");
        $("#acctStatus").attr("onclick", "activateUser()");
    }
    
    //show privilege
    var p = getPrivilege(user_list[i].type);
    
    $("#privilege").text("Privilege: " + p);
}

function cancelProfile(){
    window.location = '/users/' + username;
}

function submitProfile(){
    var name = document.getElementById("name").value;
    var dob = document.getElementById("dob").value;
    var sex = document.getElementById("sex").value;
    var address = document.getElementById("address").value;
    var phone = document.getElementById("phone").value;
    var email = document.getElementById("email").value;
    var conditions = document.getElementById("conditions").value;
    var allergies = document.getElementById("allergies").value;
    var drugs = document.getElementById("drugs").value;
    var emerName = document.getElementById("emer-name").value;
    var emerPhone = document.getElementById("emer-phone").value;
    var emerEmail = document.getElementById("emer-email").value;

    $.ajax({
        url: "/users/profile/"+username,
        data: {
            name : name,
            dob : dob,
            sex : sex,
            address : address,
            phone : phone,
            email : email,
            conditions : conditions,
            allergies : allergies,
            drugs : drugs,
            emerName : emerName,
            emerPhone : emerPhone,
            emerEmail : emerEmail
        },
        type : "POST",
        dataType : "json",
        statusCode: {
            404: function() {
                console.log("404 error");
            },
            201: function(data) {
                console.log("successfully updated profile of " + name);
                window.location = '/users/' + username;

            },
            401: function(data) {
                console.log("401 error");
            },
            success: function () {
                console.log("Profile update Ajax success");
            },
            error: function(error){
                console.log("Profile update Ajax error");
            }
        }
    });
}

function addGroupMember(groupName, memberName) {
	$.ajax({
        url: "/groups/" + groupName + "/members/" + memberName,
        data: {
            groupName: groupName,
            memberName: memberName
        },
        type: "POST",
        dataType: "json"
    }).done(function(data) {
        console.log(data);

    }).fail(function(XHR) {
        console.log(XHR);
    });
}

function deleteGroupMember(groupName, memberName) {
	$.ajax({
        url: "/groups/" + groupName + "/members/" + memberName,
        data: {
            groupName: groupName,
            memberName: memberName
        },
        type: "DELETE",
        dataType: "json"
    }).done(function(data) {
        console.log(data);

    }).fail(function(XHR) {
        console.log(XHR);
    });
}

function getPrivilege(userType){
	switch(userType % 10){
	    case 0:
	        return "Citizen";
	    case 1:
	    	return "Administrator";
	    case 3:
	    	return "Dispatcher";
	    case 4:
	    	return "Police Chief";
	    case 5:
	    	return "Patrol Officer";
	    case 6:
	    	return "Fire Chief";
	    case 7:
	    	return "Firefighter";
	    case 8:
	    	return "Paramedic";
	    case 9:
	    	return "Nurse";
	}
}

window.onload = function getUsername(){
    userToChange = document.getElementById("userinfo").innerHTML;
    console.log(userToChange);
}

$(document).ready(function(){
    $("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Profile</a>");
});