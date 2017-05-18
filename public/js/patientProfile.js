$(function () {
   var dobRawValue = $("#dateOfBirth").text();
   console.log("DOB = " + dobRawValue);

   var millis = Date.parse(dobRawValue);
   var DOB = new Date(millis);
   var DOBString = DOB.getUTCMonth() + "/" + DOB.getUTCDate() + "/" + DOB.getUTCFullYear();

   var dateToShow = new Date(DOB.getUTCFullYear(), DOB.getUTCMonth(), DOB.getUTCDate());

   $("#patientDOB").datepicker("update", dateToShow);
});

function updatePatient() {
    var DOBVal = $("#patientDOB").datepicker().val();

    var patientLocation = 0;
    if($("#locationER").is(":checked")) {
        patientLocation = 1;
    }

    var patientToUpdate = {
        id: $("#patientId").val(),
        incidentId: $("#incidentId").text(),
        hospitalName: $("#hospitalName").text(),
        hasBed: $("#hasBed").text(),
        priority: $("#priority").val(),
        location: patientLocation,
        name: $("#patientName").val(),
        dateOfBirth: new Date(DOBVal),
        age: $("#patientAge").val(),
        sex: $("#female").is(":checked"),
        conscious: $("#consciousYes").is(":checked"),
        normalBreathing: $("#breathYes").is(":checked"),
        complaint: $("#complaints").val(),
        condition: $("#condition").val(),
        drugs: $("#drugs").val(),
        allergies: $("#allergies").val()
    };
    console.log("Sending Patient Data: " + JSON.stringify(patientToUpdate));
    $.ajax({
        url: "/patients/update/"+patientToUpdate.id,
        data: patientToUpdate,
        type: "POST",
        dataType: "json",
        statusCode: {
            200: function () {
                console.log("Successfully Updated Patient " + JSON.stringify(patientToUpdate));
                alertSuccessfulPatientOperation("updated");
            },
            404: function () {
                console.log("Error Updating Patient " + JSON.stringify(patientToUpdate));
                alertFailedPatientOperation("update");
            },
            500: function () {
                console.log("Error Updating Patient " + JSON.stringify(patientToUpdate));
                alertFailedPatientOperation("update");
            },
            success: function () {
                console.log("Successfully Updated Patient " + JSON.stringify(patientToUpdate));
                alertSuccessfulPatientOperation("updated");
            },
            failure: function () {
                console.log("Error Updating Patient " + JSON.stringify(patientToUpdate));
                alertFailedPatientOperation("update");
            }
        }
    });
}

function alertFailedPatientOperation(operation) {
   bootbox.alert("Failed to "+operation+" patient. Please try again!");
}

function alertSuccessfulPatientOperation(operation) {
   bootbox.alert({
      message: "Successfully "+operation+" patient!",
      callback: function() {
         window.location.href = "/patients";
      }
   });
}

function redirectToFindHospital() {
   window.location.href = "/findHospital";
}

function cancelPatient() {
   bootbox.confirm({
      message: "Are you sure you want to cancel?",
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
            window.location.href = "/patients";
         }
      }
   });
}

function checkDeletePatient() {
   bootbox.confirm({
      message: "Are you sure you want to delete this patient?",
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
            deletePatient();
         }
      }
   });
}

function deletePatient() {
   var patientId = $("#patientId").val();
   var patientName = $("#patientName").val();
   console.log("Deleting Patient " + patientName + "'s record");
   $.ajax({
      url: "/patients/delete/"+patientId,
      data: {
         id: patientId
      },
      type: "POST",
      dataType: "json",
      statusCode: {
          200: function () {
             console.log("Successfully Deleted Patient " + patientName);
             alertSuccessfulPatientOperation("deleted");
          },
          404: function () {
             console.log("Error Deleting Patient " + patientName);
             alertFailedPatientOperation("delete");
          },
          500: function () {
             console.log("Error Deleting Patient " + patientName);
             alertFailedPatientOperation("delete");
          },
          success: function () {
             console.log("Successfully Deleted Patient " + patientName);
             alertSuccessfulPatientOperation("deleted");
          },
          failure: function () {
             console.log("Error Deleting Patient " + patientName);
             alertFailedPatientOperation("delete");
          }
      }
   });
}
