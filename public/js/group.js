var socket = io();
// handle membership
var membersInGroup = [];
var membersNotInGroup = [];
var newMembers = [];
var deleteMembers = [];

function createGroup() {
    console.log("create a new group.");
    var groupName = $("input#groupName").val();
    var groupDescription = $("input#groupDescription").val();

    // input validation
    if (groupName == "") {
        $("#invalidInput").html("Group name is missing.");
        return;
    }

    // doing AJAX call
    $.ajax({
        url: "/groups",
        data: {
            groupName: groupName,
            groupDescription: groupDescription
        },
        type: "POST"
    }).done(function(data) {
        console.log(data);
        updateGroupMembers(groupName);
    }).fail(function(XHR) {
        $("#invalidInput").html(XHR.responseText);
        console.log(XHR);
    });

    // reset from
    document.getElementById("invalidInput").innerText = "";
}

function updateGroup(originalGroupName) {
    console.log("update a group.");
    var groupName = $("input#groupName").val();
    var groupDescription = $("input#groupDescription").val();

    // input validation
    if (groupName == "") {
        $("#invalidInput").html("Group name is missing.");
        return;
    }
    // doing AJAX call
    $.ajax({
        url: "/group",
        data: {
            groupName: groupName,
            groupDescription: groupDescription,
            originalGroupName: originalGroupName
        },
        type: "PUT"
    }).done(function(data) {
        console.log(data);
        updateGroupMembers(groupName);
    }).fail(function(XHR) {
        $("#invalidInput").html(XHR.responseText);
        console.log(XHR);
    });

    // reset from
    document.getElementById("invalidInput").innerText = "";
}

function deleteGroup(groupName) {
    console.log("delete group: " + groupName);
    bootbox.confirm({
        message: "Are you sure to delete?",
        buttons: {
            confirm: {
                label: "YES"
            },
            cancel: {
                label: "NO"
            }
        },
        callback: function(confirm) {
            if (confirm === false)
                return;

            // doing AJAX call
            $.ajax({
                url: "/groups/"+groupName,
                data: {
                    groupName: groupName
                },
                type: "DELETE"
            }).done(function(data) {
                console.log(data);
                window.location.assign("/groups");
            }).fail(function(XHR) {
                console.log(XHR);
            });
        }
    });
}

function removeElement(arr, ele) {
    var idx = arr.indexOf(ele);
    if (idx !== -1) {
        arr.splice(idx, 1);
        return arr;
    } else {
        return arr;
    }
}

function addMemberToGroup(memberName) {
    if (membersInGroup.indexOf(memberName) !== -1) {
        return;
    }
    membersInGroup.push(memberName);
    newMembers.push(memberName);
    membersNotInGroup = removeElement(membersNotInGroup, memberName);
    deleteMembers = removeElement(deleteMembers, memberName);

    // update UI
    $("#" + memberName).remove();
    $("#groupMembers").append(
        // li.list-group-item(id=member.groupMember) #{member.groupMember}
        //     a.pull-right.btn.btn-xs.btn-primary(type="button", onclick = 'removeMemberFromGroup(\"'+member.groupMember+'\")') -
        "<li class='list-group-item' id='"+memberName+"'>" +
            memberName +
            "<a class='pull-right btn btn-xs btn-primary' type='button'" +
            "onclick='removeMemberFromGroup(\""+memberName+"\")'>-</a>" +
        "</li>"
    )
}

function removeMemberFromGroup(memberName) {
    if (membersNotInGroup.indexOf(memberName) !== -1) {
        return;
    }
    membersNotInGroup.push(memberName);
    deleteMembers.push(memberName);
    membersInGroup = removeElement(membersInGroup, memberName);
    newMembers = removeElement(newMembers, memberName);

    // update UI
    $("#" + memberName).remove();
    $("#allUsers").append(
        // li.list-group-item(id=member.groupMember) #{member.groupMember}
        //     a.pull-right.btn.btn-xs.btn-primary(type="button", onclick = 'addMemberToGroup(\"'+member.groupMember+'\")') -
        "<li class='list-group-item' id='"+memberName+"'>" +
            memberName +
            "<a class='pull-right btn btn-xs btn-primary' type='button'" +
            "onclick='addMemberToGroup(\""+memberName+"\")'>+</a>" +
        "</li>"
    )
}

function removeMeFromGroup(memberName, groupName) {
    console.log("remove member to group: " + memberName + "to " + groupName);
    var r = confirm("Are you sure to remove?");
    bootbox.confirm({
        message: "Are you sure to leave this group?",
        buttons: {
            confirm: {
                label: "YES"
            },
            cancel: {
                label: "NO"
            }
        },
        callback: function (confirm) {
            if (confirm === false)
                return;

            // doing AJAX call
            $.ajax({
                url: "/groups/"+groupName + "/members/" + memberName,
                data: {
                    groupName: groupName,
                    memberName: memberName
                },
                type: "DELETE",
                dataType: "json"
            }).done(function(data) {
                console.log(data);
                $("#"+memberName).remove();
            }).fail(function(XHR) {
                console.log(XHR);
                alert("Can not remove you from this group");
            });
        }
    });
}

function addGroupToGroup(groupName) {
    // doing AJAX call
    $.ajax({
        url: "/groups/"+groupName + "/members/",
        type: "GET",
        dataType: "json"
    }).done(function(data) {
        console.log(data);
        var groupMembers = [];
        for (var i in data) {
            groupMembers.push(data[i].groupMember);
        }
        bootbox.confirm({
            message: "You will be adding following users to the group: " + groupMembers.toString() + ".",
            buttons: {
                confirm: {
                    label: "Confirm"
                },
                cancel: {
                    label: "Cancel"
                }
            },
            callback: function (confirm) {
                if (confirm === false)
                    return;
                for (var i in groupMembers) {
                    addMemberToGroup(groupMembers[i]);
                }
            }
        });
    }).fail(function(XHR) {
        console.log(XHR);
        alert("Can not remove you from this group");
    });
}

function updateGroupMembers(groupName) {
    $.ajax({
        url: "/groups/"+groupName + "/members/",
        type: "POST",
        data: {
            newMembers: JSON.stringify(newMembers),
            deleteMembers: JSON.stringify(deleteMembers)
        }
    }).done(function(data) {
        console.log(data);
        window.location = "/group/"+groupName;
    }).fail(function(XHR) {
        console.log(XHR);
        alert("Update group members failed.");
    });
}

$(document).ready(function() {
    $("#groupMembers li").each(function(item) {
        membersInGroup.push($(this).attr("id"));
    });
    $("#allUsers li").each(function(item) {
        membersNotInGroup.push($(this).attr("id"));
    });
});