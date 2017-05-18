var me;

$(document).ready(function(){
	me = $("#author").html();
	$("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Bookmarked Messages</a>");
});

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