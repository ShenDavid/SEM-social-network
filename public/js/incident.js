function setEmergency(emergency) {
    $("#type").val(emergency);
    if (emergency == "Medical") {
        $(".emergency_panel").hide();
        $("#emergency_medical").show();
    }
    else if (emergency == "Fire") {
        $(".emergency_panel").hide();
        $("#emergency_fire").show();
    }
    else if (emergency == "Police") {
        $(".emergency_panel").hide();
        $("#emergency_police").show();
    }
}

function transferCommandAjax(incidentId) {
    var commander = $("input[name=availableChief]:checked").val();
    $.ajax({
        url: "/incident/transferCommand/" + incidentId,
        data: {
            commander: commander
        },
        type: "POST"
    }).done(function (data) {
        console.log(data);
        $("input#commander").val(commander);
        $("#transferCommandModal").modal('hide');
    }).fail(function (XHR) {
        $("#invalidInput").html(XHR.responseText);
        console.log(XHR);
    });
}

function transferCommand(incidentId) {
    bootbox.confirm({
        message: "Do you want to save the unsaved data?",
        buttons: {
            confirm: {
                label: "YES"
            },
            cancel: {
                label: "NO"
            }
        },
        callback: function (confirm) {
            if (confirm) {
                createOrUpdateIncident(function () {
                    transferCommandAjax(incidentId);
                });
            } else {
                transferCommandAjax(incidentId);
            }
        }
    });
}

function allocateResource(incidentId) {
    window.location.assign("/allocateResource");
}

function closeIncidentAjax(incidentId) {
    bootbox.confirm({
        message: "Are you sure to close this incident?",
        buttons: {
            confirm: {
                label: "YES"
            },
            cancel: {
                label: "NO"
            }
        },
        callback: function (confirm) {
            if (confirm) {
                // doing AJAX call
                $.ajax({
                    url: "/incident/changeStatus/" + incidentId,
                    data: {
                        newState: "Closed"
                    },
                    type: "POST"
                }).done(function (data) {
                    console.log(data);
                    window.location.assign("/incident/" + incidentId);
                }).fail(function (XHR) {
                    $("#invalidInput").html(XHR.responseText);
                    console.log(XHR);
                });
            }
        }
    });
}

function closeIncident(incidentId) {
    bootbox.confirm({
        message: "Do you want to save the unsaved data?",
        buttons: {
            confirm: {
                label: "YES"
            },
            cancel: {
                label: "NO"
            }
        },
        callback: function (confirm) {
            if (confirm) {
                createOrUpdateIncident(function () {
                    closeIncidentAjax(incidentId);
                });
            } else {
                closeIncidentAjax(incidentId);
            }
        }
    });
}

function createOrUpdateIncident(callback) {
    var form_data = $("#incident_form").serialize();
    console.log(form_data);

    // doing AJAX call
    $.ajax({
        url: "/incidents",
        data: form_data,
        type: "POST"
    }).done(function(data) {
        console.log(data);
        if (callback === undefined) {
            window.location.assign("/incident/"+data._id);
        } else {
            callback(data);
        }
    }).fail(function(XHR) {
        $("#invalidInput").html(XHR.responseText);
        console.log(XHR);
    });
}

var map;
var lat;
var lng;
function showAddress() {
    GMaps.geocode({
        address: $('#address').val(),
        callback: function (results, status) {
            if (status == 'OK') {
                var latlng = results[0].geometry.location;
                lat = latlng.lat();
                lng = latlng.lng();
                map.setCenter(latlng.lat(), latlng.lng());
                map.addMarker({
                    lat: latlng.lat(),
                    lng: latlng.lng(),
                    click: function(e) {
                        lat = e.position.lat();
                        lng = e.position.lng();
                        setAddress();
                    }
                });
            }
        }
    });
}

function setAddress() {
    GMaps.geocode({
        lat: lat,
        lng: lng,
        callback: function(results, status) {
            if (status == 'OK') {
                $("#address").val(results[0].formatted_address);
            }
        }
    });
}

var patient_form_template = "";
var patient_count = 0;
function addNewPatientForm() {
    var patient_form = patient_form_template.replace(/\[0\]/g, `[${patient_count}]`);
    var patient_form_id = `patient-${patient_count}`;
    patient_form = `
<div class="patient_form" id="#{patient_form_id}">
    <h5>Patient ${patient_count}:</h5>
    ${patient_form}
</div>`;
    $(patient_form).insertBefore("#patient_form_holder")
        .find(".delete_patient").click(function() {
            $(this).parent().remove();
    });

    patient_count++;
}

function treatPatient(incidentId, redirectUrl) {
    bootbox.confirm({
        message: "Do you want to save the unsaved data?",
        buttons: {
            confirm: {
                label: "YES"
            },
            cancel: {
                label: "NO"
            }
        },
        callback: function (confirm) {
            if (confirm) {
                createOrUpdateIncident(function () {
                    window.location.assign(redirectUrl);
                });
            } else {
                window.location.assign(redirectUrl);
            }
        }
    });
}

$(document).ready(function() {
    // patient
    $(".patient-dateOfBirth").datepicker();
    patient_form_template = $("#patient_form_template").html();
    $("#patient_form_template").remove();

    // setup map
    map = new GMaps({
        el: '#map',
        lat: 0,
        lng: 0
    });
    if ($('#address').val() === "") {
        GMaps.geolocate({
            success: function (position) {
                map.setCenter(position.coords.latitude, position.coords.longitude);
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                map.addMarker({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    click: function (e) {
                        lat = e.position.lat();
                        lng = e.position.lng();
                        setAddress();
                    }
                });
                setAddress();
            },
            error: function (error) {
                console.log('Geolocation failed: ' + error.message);
            },
            not_supported: function () {
                console.log("Your browser does not support geolocation");
            },
            always: function () {
                console.log("Done!");
            }
        })
    } else {
        showAddress();
    }
});