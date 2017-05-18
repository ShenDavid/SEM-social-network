//notify user that there is an announcement
socket.on('notify_announcement', function(ann){
  if(window.location.pathname!="/messages/announcements"){
    console.log("notify about new announcement");
    $('#notify').addClass("notify");
    $('#notify_announcement').addClass("notify");
    $('#hamburger').addClass("notify");
  }
});

//notify user that there is a message
socket.on('notify_message', function(author, receiver){
  console.log(window.location.pathname.split('/'));
  var path = window.location.pathname.split('/');
  var path_str = path[1]+path[2]
  if((receiver==username || receiver=="PM") &&
    (path_str != "messagespublic" && path_str != "messagesprivate")){
    console.log("notify about new message");
    $('#notify').addClass("notify");
    $("#notify_message").addClass("notify");
    $('#hamburger').addClass("notify");
  }
});

//when a notification is red
//clicking on it should remove the redness
$(document).ready(function(){
  $("#notify").on('click', function(){
    console.log("time to remove notify");
    $(this).removeClass("notify");
  });
  $("#hamburger").on('click', function(){
    console.log("time to remove notify");
    $(this).removeClass("notify");
  });
});

socket.on('user_deactivate', function(userDeactivated){
  if(userDeactivated==username){
    console.log("This user is being deactivated.");
    window.location.href = "/logout?deactivate=1";
  }
});

// notify new member added to the group
// request server to send any pending alert
$.ajax({
  url: "/groups/alert",
  type: "GET"
});
socket.on('new_member_added_to_group', function(groupName, groupMember){
  if(groupMember == username){
    bootbox.confirm({
      message: "You have been added to the group " + groupName,
      buttons: {
        confirm: {
          label: "GO SEE"
        },
        cancel: {
          label: "OK"
        }
      },
      callback: function(confirm) {
        $.ajax({
          url: "/groups/alert",
          data: {
            groupName: groupName,
            groupMember: groupMember
          },
          type: "POST",
          success: function(result){
            if (confirm === true)
              window.location.href = "/group/"+groupName;
          }
        });
      }
    });
  }
});
