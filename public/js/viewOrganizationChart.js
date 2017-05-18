
$(document).ready(function(){

    loadOrganizationChart();
});

function loadOrganizationChart() {
    $.ajax({
        type: "GET",
        url: '/viewOrganization',
        contentType: 'application/json',
        statusCode: {
            200: function(data) {
                //var data = jQuery.parseJSON(data);
                var chiefs = data.chiefs;
                var organization = data.organization;
                var vehicle = data.vehicle;

                var carIndex = 0;
                for (var i in chiefs) {
                    var chief = chiefs[i];
                    var type = chief.type;
                    var title = (type === 4 || type === 14) ? 'CP. ': 'CF. ';
                    //var vehicleType = (type === 4 || type === 14) ? 'car': 'truck';
                    var vehicleType = (type === 4 || type === 14) ? '<span class="fa fa-taxi"></span> car' : '<span class="fa fa-truck"></span> truck';
                    var responders = '';
                    var vehicles = '';
                    for (var j in organization) {
                        var item = organization[j];
                        if (item.chiefName === chief.username) {
                            responders += item.responderName + '<br>';
                        }
                    }
                    for (var k in vehicle) {
                        var item = vehicle[k];
                        if (item.chiefName === chief.username) {

                            var count = item.total;
                            for (var i = 0; i < count; i ++) {
                                vehicles += vehicleType + carIndex + '<br>';
                                carIndex ++;
                            }
                        }
                    }

                    var html =
                            '<div class="panel panel-primary"><div class="panel-heading">' + title + chief.username + '</div>' +
                            '<div class="panel-body">' + responders + '</div>' +
                            '<div class="panel-footer">' + vehicles + '</div>' +
                            '</div><br>';
                    $('#chart').append(html);
                }
            }
        }
    });
};
