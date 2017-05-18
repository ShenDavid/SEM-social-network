window.latitude="";	//temporary, for test of location
window.longitude="";
window.city="";
var receiver;
var me;
var currentChatTarget;
var listusers;
var listgroups;

var uploadedFile;
var isUploading = false;

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Messages</a>");
});

function enterSend(event){    // press enter to directly send message
	if(event.keyCode == 13) {
		verifyMsg();
	}
}

function toggleOptionButtons() {
	if ($("#attachment-ui").is(":visible")) {
        $("#attachment-ui").hide();
	}
	else {
        $("#attachment-ui").show();
	}
	
    window.scrollTo(0,document.body.scrollHeight);
}

function selectFile() {
    var files = $('#upload-input').get(0).files;
    var fileName = files[0].name;

    $("#loadingDiv").show();
    isUploading = true;

    if (files.length > 0){
        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploads', file, file.name);
            console.log(formData);
        }

        $.ajax({
            url: '/api/upload/file',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType : "json",
            success: function(data){
				uploadedFile = {
					fileUri: data.url,
					attachmentType: 1,
					name: fileName
				};
                fileName = '';

                $("#loadingDiv").hide();
                isUploading = false;
            }
        });
    }
};

function selectImage() {
    console.log("select file");

    var files = $('#upload-input2').get(0).files;
    var fileName = files[0].name;

    $("#loadingDiv").show();
    isUploading = true;

    if (files.length > 0){
        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploadsimg', file, file.name);
            console.log(formData);
        }

        $.ajax({
            url: '/api/upload/image',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType : "json",
            success: function(data){
                uploadedFile = {
                    fileUri: data,
                    attachmentType: 2,
                    name: fileName
                };
                fileName = '';
                console.log('upload successful!\n' + data + "-----" + uploadedFile);

                $("#loadingDiv").hide();
                isUploading = false;
            }
        });
    }
};

function selectVideo() {
    console.log("select file");

    var files = $('#upload-input3').get(0).files;
    var fileName = files[0].name;

    $("#loadingDiv").show();
    isUploading = true;

    if (files.length > 0){
        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            formData.append('uploadsvideo', file, file.name);
            console.log(formData);
        }

        $.ajax({
            url: '/api/upload/video',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType : "json",
            success: function(data){
                uploadedFile = {
                    fileUri: data,
                    attachmentType: 3,
                    name: fileName
                };
                fileName = '';
                console.log('upload successful!\n' + data + "-----" + uploadedFile);

                $("#loadingDiv").hide();
                isUploading = false;
            }
        });
    }
}

function verifyMsg() {
    if (!isUploading) {
        console.log("in verify");

        var msg = document.getElementById("msgIn").value;

        console.log("Author is " + me);
        console.log("Receiver is " + receiver);
        console.log("Msg is " + msg);

        if (msg != "") {
            //if there is no error, send data to server to either log in or create new user
            geoFindMe();
            var dd1 = new Date();
            var n = dd1.toISOString();
            var nonlyDate = n.slice(0, 10);
            var nonlyTime = n.slice(11, 19);
            var newDate = nonlyDate + " " + nonlyTime;

            getCityName().then(function () {
                $.ajax({
                    url: "/messages/public",
                    data: JSON.stringify({
                        messageData: msg,
                        author: me,
                        receiver: receiver,
                        postedAt: newDate,
                        messageType: 0,
                        latitude: window.latitude,
                        longitude: window.longitude,
                        city: window.city,
                        attachment: uploadedFile
                    }),
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
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
                $("#msgIn").val("");
                currentChatTarget.className = "list-group-item active";
            });
        }
    }
}

function msgAppend(msg_list,name,time,content,status,city,latitude, attachment){		//generate a msg box to display
	var attachmentTemplate = "";
	
	if (attachment) {
        if (attachment.attachmentType == 1) {
            attachmentTemplate = appendFileAttachment(attachment);
        } else if (attachment.attachmentType == 2) {
        	attachmentTemplate = appendImageAttachment(attachment);
		} else {
        	attachmentTemplate = appendVideoAttachment(attachment);
		};
    }

	msg_list.append("<div class='bubble-box'><table>"+
        "<tr>"+
          "<td class='bubble-name'><img src='/images/"+status+".png' style=\"width:30px; height:30px;\">"+name+"</td>"+
          "<td class='bubble-time'>"+time+"</td>"+
        "</tr></table>"+
        "<table class='msg-bubble'><tr>"+
          "<td class='bubble-content' colspan='2'>"+content+"</td>" +
          "<td class='bubble-time'>"+city+"</td>"+
        "</tr>"+
		"<tr>" +
			"<td class='bubble-content' colspan='2'></td>" +
	        "<td class='bubble-time'>" +
	        	"<a class='btn btn-primary' onclick='bookmarkMessage('" + content + "', '" + name + "', 'PM', '" + status + "', '" + time + "', '" + city + "', '" + latitude + "', '"  + longitude + "', '" + attachment + "')'>" +
	        		"<span class='fa fa-bookmark' style='color:white'></span>" +
	        	"</a>" +
        	"</td>" +
		"</tr>" +
        "</table>"+attachmentTemplate+"</div>"
	);
}

function appendFileAttachment(attachment) {
	return "<table class='msg-bubble'>" +
		"<tr>"+
        	"<td class='bubble-content'>" +
				"<span class='glyphicon.glyphicon-file'>" +
					"<a href="+attachment.fileUri+" style='padding:5px'>" + attachment.name +
					"</a>"+
				"</span>"+
			"</td>"+
        "</tr>"+
        "</table></div>";
}

function appendImageAttachment(attachment) {
    return "<table class='msg-bubble'>" +
        "<tr>"+
        	"<td class='bubble-content'>" +
        		"<span class='glyphicon.glyphicon-file'>" +
					"<img class='attachment-image' src="+attachment.fileUri+" style='width:300px;height:170px;'>" +
        		"</span>"+
        	"</td>"+
        "</tr>"+
        "</table></div>";
}

function appendVideoAttachment(attachment) {
    return "<table class='msg-bubble'>" +
        "<tr>" +
        	"<td class='bubble-content'>" +
        		"<span class='glyphicon.glyphicon-file'>" +
        			"<video width='400' controls>" +
        				"<source src='" + attachment.fileUri + "' type='video/mp4'>" +
        			"</video>" +
        		"</span>" +
        	"</td>" +
        "</tr>" +
        "</table></div>";
}

function scrollbarToBottom(){
	var div = document.getElementById("msg-list");
	div.scrollTop = div.scrollHeight;
}

var socket = io();

socket.on('broadcast_message', function(msg, socket_author, socket_receiver){
	receiver = document.getElementById("receiver").innerHTML;
	
	if((socket_receiver == receiver) || (receiver == socket_author)){
		var dd1 = new Date();
	  	var n = dd1.toISOString();
	  	var nonlyDate = n.slice(0,10);
	  	var nonlyTime = n.slice(11,19);
	  	var newDate = nonlyDate +" "+ nonlyTime;
		console.log("Socket Message received");
		msgAppend($(".msg-list"),msg.author,newDate,msg.messageData,msg.currStatus,msg.city,msg.latitude, msg.attachment);
		scrollbarToBottom();
	}
});

socket.on('notify_message', function(socket_author, socket_receiver){
	console.log("author is " + socket_author);
	console.log("receiver is " + socket_receiver);
	var target = -1;
	var urlToMessages = "";
	var isGroup = false;
	var isUser = false;

	if(socket_receiver==me){
		for (var i = 0; i < listusers.length; i++) {
			console.log(listusers[i].getElementsByTagName('span')[0].innerHTML);
			if((listusers[i].getElementsByTagName('span')[0].innerHTML==socket_author)){
				target = listusers[i];
				console.log("target user found " + socket_author);
				isUser = true;
			}
		}
	}

	if(isUser == false){

		for (var i = 0; i < listgroups.length; i++) {
			if(listgroups[i].getElementsByTagName('span')[0].innerHTML==socket_receiver){
				target = listgroups[i];
				isGroup = true;
			}
		}
	}
	
	if(target!=-1){
		$('#myModal').modal('show');
		
		if (isGroup) {
			urlToMessages = '/messages/groups/' + socket_receiver ;
		}
		else {
			urlToMessages = '/messages/private/' + socket_receiver+ '/' + socket_author;
		}

		document.getElementById("goBtn").onclick = function () {
			location.href = urlToMessages;
    	};

		var activeTarget = document.getElementById("chatlist").innerHTML;
		document.getElementById("chatlist").innerHTML=activeTarget+"!!!"+socket_author;
		console.log("New chatlist: "+document.getElementById("chatlist").innerHTML);
	}
});

socket.on('new_user_for_chat', function(user_list){
	var first = true;
	
	$('ul.list-group li').each(function(){
		if(first){
			first = false;
		} else {
			$(this).remove();
		}
	});
	
	for (var i = 0; i < user_list.length; i++){
		if(user_list[i].username == receiver)
			$('ul.list-group').append(
				"<li class='list-group-item active'>"+
				"<a href='/messages/private/"+me+"/"+user_list[i].username+"'>"+
				"<div class='media user-list-height'>"+
				"<div class='media-left'>"+
				"<span class='user user-list-name'>" +
				user_list[i].username +
				"</span></div></div></a></li>"
			);
		else
			$('ul.list-group').append(
				"<li class='list-group-item'>"+
				"<a href='/messages/private/"+me+"/"+user_list[i].username+"'>"+
				"<div class='media user-list-height'>"+
				"<div class='media-left'>"+
				"<span class='user user-list-name'>" +
				user_list[i].username +
				"</span></div></div></a></li>"
			);
	}
	
	listusers = document.getElementsByClassName("list-group-item");
	var activeTarget = document.getElementById("chatlist").innerHTML;

	var res = activeTarget.split("!!!");
	
	for (var j = res.length - 1; j >= 0; j--)
		if(res[j]!=""&&res[j]!=me)
			for (var i = 0; i < listusers.length; i++)
				if(listusers[i].getElementsByTagName('span')[0].innerHTML==res[j])
					listusers[i].className = "list-group-item redBackground";
});

function geoFindMe(){
	function success(position){
		window.latitude = position.coords.latitude;
		window.longitude = position.coords.longitude;
	};
	
	navigator.geolocation.getCurrentPosition(success);
}

function getCityName(){
  var geocodingAPI = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +window.latitude+","+window.longitude;
  
  return $.getJSON(geocodingAPI, function (json) {
     if (json.status == "OK") {
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
    $("#alertDiv").hide();

    $("#loadingDiv").hide();

    $("#attachment-ui").hide();

    $('#upload-input').on('change', function(){
        selectFile();
    });

    $('#upload-input2').on('change', function(){
        selectImage();
    });

    $('#upload-input3').on('change', function(){
        selectVideo();
    });

	scrollbarToBottom();
	me = document.getElementById("author").innerHTML;
	listusers = document.getElementsByClassName("userItem");
	listgroups = document.getElementsByClassName("groupItem");

	receiver = document.getElementById("receiver").innerHTML;
    
    if(receiver == "Fire" || receiver == "Police"){
        $("#alertDiv").show();
    }

	for (var i = 0; i < listusers.length; i++) {
		if((listusers[i].getElementsByTagName('span')[0].innerHTML==receiver)){
			currentChatTarget = listusers[i];
			currentChatTarget.className = "list-group-item active userItem";
		}
		
	    else
	    	listusers[i].className = "list-group-item userItem";
	}
	
	for (var i = 0; i < listgroups.length; i++) {
		if((listgroups[i].getElementsByTagName('span')[0].innerHTML==receiver)){
			currentChatTarget = listgroups[i];
			currentChatTarget.className = "list-group-item active groupItem";
		}
	    else
	    	listgroups[i].className = "list-group-item groupItem";
	}
	
	var activeTarget = document.getElementById("chatlist").innerHTML;
	var res = activeTarget.split("!!!");
	
	for (var j = res.length - 1; j >= 0; j--)
		if(res[j]!=""&&res[j]!=me)
			for (var i = 0; i < listusers.length; i++)
				if(listusers[i].getElementsByTagName('span')[0].innerHTML==res[j])
					listusers[i].className = "list-group-item redBackground";
	
	geoFindMe();
}

function bookmarkMessage(messageData, author, receiver, currStatus, postedAt, city, latitude, longitude, attachment) {
	var data = {
		username: me,
		messageData: messageData,
		author: author,
		receiver: receiver,
		currStatus: currStatus,
		postedAt: postedAt,
		city: city,
		latitude: latitude,
		longitude: longitude,
		attachment: attachment
	}

    $.ajax({
        url: '/messages/bookmark',
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

function unbookmarkMessage(messageData, author, receiver, postedAt) {
	var data = {
		username: me,
		messageData: messageData,
		author: author,
		receiver: receiver,
		postedAt: postedAt
	}

    $.ajax({
        url: '/messages/unbookmark',
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