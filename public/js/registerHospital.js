function submitHospital(){
	var username = $('#username').val();
	var userType = $('#userType').val();
	var name = $('#hospitalName').val();
	var address = $('#hospitalAddress').val();
	var description = $('#hospitalDescription').val();
	var workAtHospital = $('#workAtHospital').is(':checked');
	var nurseLabel = $('#nursesLabel').text();
	
	var nurses = [];

	if (nurseLabel !== '' && nurseLabel !== 'Nurses: None listed') {
		nurses = nurseLabel.replace('Nurses: ', '').split(', ');
	}

	nurses = nurses.filter(function(entry) {
		return entry.trim() !== '';
	});

	if (name === ''){
		alert('Missing hospital name')
	}
	else if (address === ''){
		alert('Missing hospital address')
	}
	else if (description === ''){
		alert('Missing hospital description')
	}
	else {
		if (workAtHospital && userType === '9' && nurses.indexOf(username) < 0) {
			nurses.push(username);
		}
		
	    var data = {
			name: name,
			address: address,
			description: description,
			nurses: nurses
		}

	    $.ajax({
	        url: '/hospital/addUpdateHospital',
	        data: JSON.stringify(data),
	        type : 'POST',
	        contentType : 'application/json',
	        statusCode: {
		        error: function(error){
		            console.log('error in ajax: ' + error);
		        }
	        }
	    });

	    window.location.replace('/hospitalDirectory');
	}
}

function resetForm() {
	location.reload();
}

function deleteHospital() {
	var name = $('#hospitalName').val();
	
	if (name === ''){
		alert('Missing hospital name')
	}
	else {
		var confirmation = confirm('Are you sure about ddeleting this hospital?');
		
		if (confirmation) {
			var data = {
				name: name
			}
	
		    $.ajax({
		        url: '/hospital/deleteHospital',
		        data: JSON.stringify(data),
		        type : 'POST',
		        contentType : 'application/json',
		        statusCode: {
			        error: function(error){
			            console.log('error in ajax: ' + error);
			        }
		        }
		    });

		    window.location.replace('/hospitalDirectory');
		}
	}
}

$(document).ready(function(){
	var requestName = $('#requestName').val();
	
	if (requestName !== ''){
		$.ajax({
	        url: '/hospital/getHospitalByName/' + requestName,
	        type : 'GET',
	        contentType : 'application/json',
	        statusCode: {
		        200: function(data) {
		        	var hospitalName = data.name;
		        	var hospitalAddress = data.address;
		        	var hospitalDescription = data.description;
		        	var nurses = data.nurses;
		        	var nursesStr = '';
		        	
		        	for (var i = 0, len = nurses.length; i < len; i++) {
		        		nursesStr += nurses[i] + ', ';
		        	}
		        	
		        	if (nurses.length > 0){
		        		nursesStr = 'Nurses: ' + nursesStr.substring(0, nursesStr.length - 2);
		        	}
		        	else {
		        		nursesStr = 'Nurses: None listed';
		        	}

		        	$('#hospitalName').val(hospitalName);
		        	$('#hospitalAddress').val(hospitalAddress);
		        	$('#hospitalDescription').val(hospitalDescription);
		        	$('#nursesLabel').text(nursesStr);
		        },
		        error: function(error){
		            console.log('error in ajax: ' + error);
		        }
	        }
	    });
  	}
	
	$('#pageTitle').html("<a class='navbar-brand navbar-brand-primary' href='/'><span class='fa fa-user-md' /> Hospital</a>");
});