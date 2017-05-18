/**
 * Created by rajkiran on 4/7/17.
 */


function submit(){
    // list of all the patients for a hospital
    // loop on top of elements like these
    var error = document.getElementById("error");
    error.innerHTML = "";
    var no_error = true;

    var table = document.getElementById('assignTable'),
        rows = table.getElementsByTagName('tr'),
        i, j, cells, customerId;

    for (i = 1; i < rows.length; ++i) {
        var hospital_name,beds,srctext;
        var patients = [];
        var patient_ids = [];
        var patient_names = [];

        cells = rows[i].getElementsByTagName('td');
        if (!cells.length) {
            continue;
        }
        hospital_name= cells[0].innerHTML;
        beds = cells[1].innerHTML;
        srctext = cells[2].innerHTML;
        console.log(srctext);
        if( srctext == null ) {
            console.log( "i was here");
            if( no_error && i === rows.length - 1 ) {

                error.innerHTML = "SUCCESS";
            }
            continue;
        }
        $.each(srctext.match(/<p>[^<]*</igm), function(index, value) {
            if( value != null ) {
                console.log(index + ". " + value);
                patient_names.push(value.substring(3, value.length - 1));
            }
        });
        $.each(srctext.match(/id=\"patient[^<]*\" dr/igm), function(index, value) {
            if( value != null ) {
                console.log(index + ". " + value);
                patient_ids.push(value.substring(11, value.length - 4));
            }
        });
        for(var indexp=0;indexp<patient_names.length;indexp++){
            var patient = {
                patient_name: patient_names[indexp],
                patient_id: patient_ids[indexp]
            };
            patients.push(patient);
        }
        var hospital = {
            hospital_name: hospital_name,
            beds: beds
        };

        console.log( patients );
        if(patients.length>0) {
            for( var patient_index = 0; patient_index < patients.length; patient_index++ ){
                var hospital_information = {
                    hospital : hospital,
                    patient : patients[patient_index]
                };
                console.log( "hospilta "+ JSON.stringify(hospital_information));
                $.ajax({
                           url: '/findhospital/save',
                           data:  JSON.stringify(hospital_information),
                           type : "POST",
                           contentType : "application/json",
                           statusCode: {
                               200: function() {

                                   // you can even add a header with success message and toggle
                                   // its display on success

                               },
                               error: function(error){
                                   no_error = false;
                                   console.log("error in ajax: " + error);
                               }
                           }

                });
            }

        }
        if( no_error && i === rows.length - 1 ) {
            console.log( "i was here");
            error.innerHTML = "SUCCESS";
        }


    }


}

function resetForm() {
    window.location.replace('/findhospital');
}

function allowDrop(event) {
    event.preventDefault();
}
function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}
/*
 function drop(event) {
 event.preventDefault();
 var data = event.dataTransfer.getData("text");
 event.target.appendChild(document.getElementById(data));
 }*/


$(function () {
    $("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> Find Hospital</a>");

    $(".patientclass").draggable({
                                     revert: true,
                                     drag: function(event) {
                                         //event.preventDefault();
                                         //event.dataTransfer
                                         console.log( event );
                                         //event.dataTransfer.setData("text", event.target.id);
                                         //event.getDataTransferItem()= event.target.id;
                                     }
                                 });
    $(".ui-droppable").droppable({


                                     drop: function (event, ui) {
                                         //event.preventDefault();
                                         //var data = event.dataTransfer.getData("text");
                                         //console.log( event.target.style );
                                         var targetStyle = event.target.style;
                                         var data = ui.draggable[0].id;
                                         var draggedElement = document.getElementById(data);
                                         draggedElement.style = targetStyle;
                                         event.target.appendChild(draggedElement);
                                     }
                                 });
});



