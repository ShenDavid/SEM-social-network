$(document).ready(function(){
    $("#welcomeModal").modal('show');
});

$("#welcomeModal").on("hidden.bs.modal", function () {
    window.location = '/index'
});

