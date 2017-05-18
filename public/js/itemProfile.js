
function createItem(item){
  console.log("Create Item");
  $.ajax({
    url: "/addItem",
    data: item,
    type: "POST",
    dataType: "json",
    statusCode: {
      201: function () {
        console.log("Successfully added new Item " + JSON.stringify(item));
        alertSuccessfulItemOperation("created");
      },
      404: function () {
        console.log("Error in adding new Item " + JSON.stringify(item));
        bootbox.alert("You are not in an organization. Must be in an organization to create an item.");
      },
      500: function () {
        console.log("Error in adding new Item " + JSON.stringify(item));
        alertFailedItemOperation("create");
      },
      success: function () {
        console.log("Successfully added new Item " + JSON.stringify(item));
        alertSuccessfulItemOperation("created");
      },
      failure: function () {
        console.log("Error in adding new Item " + JSON.stringify(item));
        alertFailedItemOperation("create");
      }
    }
  });
}

function updateItem(item){
  console.log("Update Item");
  $.ajax({
    url: "/item",
    data: item,
    type: "POST",
    dataType: "json",
    statusCode: {
      200: function () {
        console.log("Successfully updated existing Item " + JSON.stringify(item));
        alertSuccessfulItemOperation("updated");
      },
      404: function () {
        console.log("Error in updating existing Item " );
        bootbox.alert("You are not in an organization. Must be in an organization to create an item.");
      },
      500: function () {
        console.log("Error in updating existing Item " + JSON.stringify(item));
        alertFailedItemOperation("update");
      },
      success: function () {
        console.log("Successfully updated existing Item " + JSON.stringify(item));
        alertSuccessfulItemOperation("updated");
      },
      failure: function () {
        console.log("Error in updating existing Item " + JSON.stringify(item));
        alertFailedItemOperation("update");
      }
    }
  });
}

function checkoutItem(itemId){
  console.log("in checkout " + itemId);
  var itemName = $("#"+itemId).val();
  console.log(itemName);
  $.ajax({
    url: "/item/checkout/" + itemId,
    type: "POST",
    dataType: "json",
    statusCode: {
      200: function () {
        console.log("Successfully checked out " + itemName);
        alertSuccessfulItemOperation("checkout");
      },
      404: function () {
        console.log("Error in updating existing Item " );
        bootbox.alert("You are not in an organization.  You cannot checkout this item.");
      },
      500: function () {
        console.log("Error in updating existing Item " );
        alertFailedItemOperation("checkout");
      },
      success: function () {
        console.log("Successfully updated existing Item ");
        alertSuccessfulItemOperation("checkout");
      },
      failure: function () {
        console.log("Error in updating existing Item ");
        alertFailedItemOperation("checkout");
      }
    }
  });

}


function submitItem() {
  var item = {
    id: $("#itemId").text(),
    name: $("#itemName").val(),
    consumable: $("#consumableYes").is(":checked"),
    firechiefName: $("#firechiefName").text(),
    checkoutBy: $("#checkoutBy").text()
  };

  console.log("Sending Item Data: " + JSON.stringify(item));
  if(item.name){
    if(item.id){
      updateItem(item);
    } else {
      createItem(item);
    }
  } else {
    bootbox.alert("Please enter a name for this item.");
  }
}

function alertFailedItemOperation(operation) {
   bootbox.alert("Failed to "+operation+" item. Please try again!");
}

function alertSuccessfulItemOperation(operation) {
   bootbox.alert({
      message: "Successfully "+operation+" item!",
      callback: function() {
         window.location.href = "/inventory";
      }
   });
}

//TODO: implement cancel Item
function cancelItem(){
  console.log("Cancel Item");
  alertSuccessfulItemOperation("cancelling");

}

function deleteItem() {
	bootbox.confirm({
		message: "Are you sure you want to delete this item?",
      buttons: {
         confirm: {
            label: "YES"
         },
         cancel: {
            label: "NO"
         }
      },
      callback: function(result) {
         if(result === true) {
            executeDeleteItem();
         }
      }
	});
}

function executeDeleteItem(){
	var itemId = $("#itemId").text();
	console.log("Delete Item " + itemId);
	$.ajax({
     url: "/item/delete/" + itemId,
     type: "POST",
     dataType: "json",
     statusCode: {
       200: function () {
         console.log("Successfully deleted item " + itemId);
			alertSuccessfulItemOperation("deleted");
       },
       404: function () {
         console.log("Error in deleted Item " + itemId);
			alertFailedItemOperation("delete");
       },
       500: function () {
         console.log("Error in deleted Item " + itemId);
			alertFailedItemOperation("delete");
       },
       success: function () {
         console.log("Successfully deleted item " + itemId);
			alertSuccessfulItemOperation("deleted");
       },
       failure: function () {
         console.log("Error in deleted Item " + itemId);
			alertFailedItemOperation("delete");
       }
     }
   });
}
