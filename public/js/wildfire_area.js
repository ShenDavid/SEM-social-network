/**
 * Created by ZeningZhang on 4/6/17.
 */


var map;
var coord = [];
var isArea = false;
var polygons = {};
var temp_poly;
var markers = {};

function deleteArea(name) {
    polygons[name].setMap(null);
    $("#" + name).remove();
    markers[name].setMap(null);

    $.ajax({
        url: "/wildfireArea/delete",
        type : "POST",
        dataType : "json",
        data: {
            name: name
        },
        statusCode: {
            404: function() {
                console.log("Couldn't get some utility category");
            },
            200: function(results) {
                console.log("Received locations of one category");
                console.log(results);
            },
            success: function () {
                console.log("Ajax success");
            },
            error: function(error){
                console.log("Ajax error");
            }
        }
    });

}
function geoFindMe(){
    GMaps.geolocate({
        success: function(position) {
            console.log(position);
            map.setCenter(position.coords.latitude, position.coords.longitude);
            map.addMarker({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                title: 'me',
                infoWindow: {
                    content: '<p>I AM HERE!</p>'
                }
            });
        },
        error: function(error) {
            console.log('Geolocation failed: '+error.message);
        },
        not_supported: function() {
            console.log("Your browser does not support geolocation");
        },
        always: function() {
            console.log("Done!");
        }
    });
}

function showAreas(){

    console.log("Areas!");
    $.ajax({
        url: "/map/" + "area",
        type : "GET",
        dataType : "json",
        statusCode: {
            404: function() {
                console.log("Couldn't get some utility category");
            },
            200: function(results) {
                console.log("Received locations of one category");
                console.log(results);

                for(var i = 0; i < results.length; i++){
                    map.addMarker({
                        icon  : "/images/map_icon/area.jpeg",
                        lat: results[i].latitude,
                        lng: results[i].longitude,
                        title: 'AREA',
                        infoWindow: {
                            content: '<p>AREA!</p>'
                        }
                    });
                }
            },
            success: function () {
                console.log("Ajax success");
            },
            error: function(error){
                console.log("Ajax error");
            }
        }
    });
};

function showBlocks(){

    console.log("Blocks!");
    $.ajax({
        url: "/map/" + "block",
        type : "GET",
        dataType : "json",
        statusCode: {
            404: function() {
                console.log("Couldn't get some utility category");
            },
            200: function(results) {
                console.log("Received locations of one category");
                console.log(results);

                for(var i = 0; i < results.length; i++){
                    map.addMarker({
                        icon  : "/images/map_icon/block.jpeg",
                        lat: results[i].latitude,
                        lng: results[i].longitude,
                        title: 'BLOCKS',
                        infoWindow: {
                            content: '<p>BLOCK!</p>'
                        }
                    });
                }
            },
            success: function () {
                console.log("Ajax success");
            },
            error: function(error){
                console.log("Ajax error");
            }
        }
    });
};



$(document).ready(function(){
    var lat;
    var lng;
    map = new GMaps({
        el: '#map',
        lat: 37.4104,
        lng: -122.0598
    });
    geoFindMe();


    if(wildfireAreaData != null) {
        console.log(wildfireAreaData);
        console.log("after");
        var pdata = JSON.parse(wildfireAreaData.replace(/&quot;/g,'"'));
        console.log(pdata);
        jQuery.each(pdata, function (i, val) {

            var bermudaTriangle = new google.maps.Polygon({
                paths: val.coordinates,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35
            });
            polygons[val.name] = bermudaTriangle;
            bermudaTriangle.setMap(map.map);
            var temp_marker = map.addMarker({
                lat: val.coordinates[0].lat,
                lng: val.coordinates[0].lng,
                title: val.name,
                infoWindow: {
                    content: val.name
                },
                id: val.name
            });
            markers[val.name] = temp_marker;
        });
    }
    //   var drawingManager = new google.maps.drawing.DrawingManager({
    //       drawingControl: true,
    //       drawingControlOptions: {
    //         position: google.maps.ControlPosition.TOP_CENTER,
    //         drawingModes: [
    //           google.maps.drawing.OverlayType.POLYGON
    //         ]
    //   }});
    // drawingManager.setMap(map.map); // map.map is the reference to original map object

    $('#wildfire_help').click(function() {
        $("#helpModal").modal('show');

    });

    $('#success_marker').click(function() {
        var t_area = $("#message-text");
        if (!$.trim(t_area.val())) {
            t_area.closest('.form-group').removeClass('has-success').addClass('has-error');
            // e.preventDefault();
        }
        else {
            var name = $("#message-text").val();
            $("#message-text").val("");
            console.log(name);
            if (name != null && polygons[name] == null) {
                // add to global variable
                if (temp_poly != null) {
                    polygons[name] = temp_poly;
                    temp_poly = null;
                }

                // append name to the list on the left

                $('#sideMenu').append('<li class="list-group-item" id=' + '"' + name + '"' + '><a ondblclick=' +
                    '"' + 'deleteArea(' + '\'' + name + '\'' + ')' + '"'
                    + '><div class="media user-list-height"><div class="media-left"><span class="user user-list-name">' + name +
                    '</span></div></div></a></li>');

                //add marker
                var temp_marker = map.addMarker({
                    lat: lat,
                    lng: lng,
                    title: 'Marker',
                    infoWindow: {
                        content: name
                    },
                    id: name
                });
                markers[name] = temp_marker;
                if (isArea == true) {
                    isArea = false;
                    $.ajax({
                        url: "/wildfireArea",
                        data: {
                            coordinates: JSON.stringify(coord),
                            name: name
                        },
                        type: "POST",
                        dataType: "json"
                    }).done(function (data) {
                        console.log(data);
                    }).fail(function (XHR) {
                        console.log(XHR);
                    });
                }
            }
            else {

            }
            $("#myModal").modal('hide');
        }
    });

    var drawingManager;
    var selectedShape;

    function clearSelection() {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    }

    function setSelection(shape) {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);
    }


    function initialize() {

        var lineSymbol = {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            scale: 3
        };

        var polyOptions = {
            fillOpacity: 0.45,
            editable: true,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000'
        };
        // Creates a drawing manager attached to the map that allows the user to draw
        // markers, lines, and shapes.
        drawingManager = new google.maps.drawing.DrawingManager({
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ],
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['polygon']
            },
            polygonOptions: polyOptions,

        });
        drawingManager.setMap(map.map);

        google.maps.event.addListener(drawingManager,'polygoncomplete',function(polygon) {
            $("#myModal").modal('show');
            temp_poly = polygon;
            var coordinates = (polygon.getPath().getArray());
            var i = 0;
            jQuery.each( coordinates, function( i, val ) {
                console.log(val);
                var obj_temp = {};
                obj_temp["lat"] = val.lat();
                obj_temp["lng"] = val.lng();
                coord[i] = obj_temp;
                if(i == 0) {
                    lat = val.lat();
                    lng = val.lng();
                }
                i++;
            });
            isArea = true;

            // Switch back to non-drawing mode after drawing a shape.
            drawingManager.setDrawingMode(null);
            // Add an event listener that selects the newly-drawn shape when the user
            // mouses down on it.
            var newShape = polygon;
            newShape.type = polygon.type;
            google.maps.event.addListener(newShape, 'click', function() {
                setSelection(newShape);
            });
            setSelection(newShape);

        });

        // Clear the current selection when the drawing mode is changed, or when the
        // map is clicked.
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);

    }
    google.maps.event.addDomListener(window, 'load', initialize);


});

$(document).ready(function(){
    $("#pageTitle").html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-users' /> wildfire Area</a>");
});