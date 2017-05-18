function doSearch() {
	console.log("Searching.");
	var searchText = document.getElementById("searchbox").value;
	// $.get("/search?keyword="+searchText); does not work
	if (searchText != ""){
		console.log("Searching........");
		window.location.href = "/search?keyword="+searchText;
	}
}

function loadMoreAnn(){
	var lastTime = document.getElementById("lastAnnTime").innerHTML;
	console.log(lastTime);
	var keyword = document.getElementById("keyword").innerHTML;
	var url = "/search?keyword="+keyword+"&more=ann&lastTime="+lastTime;
	$.get(url,function(data){
		console.log(data);
		for(var i = 0; i < data.length; i++) {
		    var ann = data[i];
		    console.log(ann.annData);
		    annAppend($('#ann-list'), ann.author, ann.postedAt, ann.annData, ann.city);
		    if(i==data.length-1)
		    	document.getElementById("lastAnnTime").innerHTML = ann.postedAt;
		}
		var div = document.getElementById("ann-list");
		div.scrollTop = div.scrollHeight;
	});
}

function loadMorePublic(){
	var lastTime = document.getElementById("lastPublicTime").innerHTML;
	console.log(lastTime);
	var keyword = document.getElementById("keyword").innerHTML;
	var url = "/search?keyword="+keyword+"&more=public&lastTime="+lastTime;
	$.get(url,function(data){
		console.log(data);
		for(var i = 0; i < data.length; i++) {
		    var msg = data[i];
		    console.log(msg.messageData);
		    msgAppend($("#msg-list"),msg.author,msg.postedAt,msg.messageData,msg.currStatus,msg.city,msg.latitude);
		    if(i==data.length-1)
		    	document.getElementById("lastPublicTime").innerHTML = msg.postedAt;
		}
		var div = document.getElementById("msg-list");
		div.scrollTop = div.scrollHeight;
	});
}

function loadMorePrivate(){
	var lastTime = document.getElementById("lastPrivateTime").innerHTML;
	console.log(lastTime);
	var keyword = document.getElementById("keyword").innerHTML;
	var url = "/search?keyword="+keyword+"&more=private&lastTime="+lastTime;
	$.get(url,function(data){
		console.log(data);
		for(var i = 0; i < data.length; i++) {
		    var msg = data[i];
		    console.log(msg.messageData);
		    msgAppend($("#msg-list2"),msg.author,msg.postedAt,msg.messageData,msg.currStatus,msg.city,msg.latitude);
		    if(i==data.length-1)
		    	document.getElementById("lastPrivateTime").innerHTML = msg.postedAt;
		}
		var div = document.getElementById("msg-list2");
		div.scrollTop = div.scrollHeight;
	});
}

function msgAppend(msg_list,name,time,content,status,city,latitude){		//generate a msg box to display
	msg_list.append("<div class='bubble-box'><table>"+
        "<tr>"+
          "<td class='bubble-name'><img src='/images/"+status+".png' style=\"width:30px; height:30px;\">"+name+"</td>"+
          "<td class='bubble-time'>"+time+"</td>"+
        "</tr></table>"+
        "<table class='msg-bubble'><tr>"+
          "<td class='bubble-content' colspan='2'>"+content+"</td>" +
          "<td class='bubble-time'>"+city+"</td>"+
        "</tr>"+
        "</table></div>"
	);
}

function annAppend(msg_list,name,time,content,city){		//generate a msg box to display
	var dd1 = new Date(time);
    var n = dd1.toISOString();
    var nonlyDate = n.slice(0,10);
    var nonlyTime = n.slice(11,16);
    var newDate = nonlyDate +" "+ nonlyTime;
	msg_list.append("<div class='bubble-box'><table>"+
        "<tr>"+
          "<td class='bubble-name'>"+name+"</td>"+
          "<td class='bubble-time'>"+newDate+"</td>"+
        "</tr></table>"+
        "<table class='msg-bubble'><tr>"+
          "<td class='bubble-content' colspan='2'>"+content+"</td>" +
          "<td class='bubble-time'>"+city+"</td>"+
        "</tr>"+
        "</table></div>"
	);
}

$(document).ready(function(){
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Search</a>");
});