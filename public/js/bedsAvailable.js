/**
 * Created by rajkiran on 4/6/17.
 */

function submit(){
    var num_beds = $('#beds').val();
    var error = document.getElementById("error");
    error.innerHTML = "";
    if ( num_beds === '') {
        alert('Missing bed numbers')
    }
    else {
        console.log( num_beds);
        var data = {
            beds : num_beds
        };
        $.ajax({
                   url: '/bedsavailable/update',
                   data: data,
                   type : "POST",
                   dataType : "json",
                   statusCode: {
                       201: function() {
                           // you can even add a header with success message and toggle
                           // its display on success
                           error.innerHTML = "SUCCESS";
                           //window.location.replace = "/bedsavailable";
                       },
                       error: function(error){
                           error.innerHTML = "FAILED";
                           console.log("error in ajax: " + error);
                       }
                   }
               });
    }
}

function resetForm() {
    window.location.replace('/bedsavailable');
}

$(function() {
    $(".fa").text("  Beds");
});
