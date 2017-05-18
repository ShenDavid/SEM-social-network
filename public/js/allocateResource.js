var allocated_data = {
  "vehicle": {},
  "person": {}
};

function allocate(allocated_to_type, allocated_to_obj, resource_type, resource_obj) {
  console.log(allocated_to_type);
  console.log(allocated_to_obj);
  console.log(resource_type);
  console.log(resource_obj);
  allocated_to_obj = JSON.parse(allocated_to_obj);
  resource_obj = JSON.parse(resource_obj);

  var resource_name = "";
  if (resource_type === "vehicle") {
    resource_name = resource_obj.name;
  } else {
    resource_name = resource_obj.username;
  }
  var allocated_name = allocated_to_obj.name;


  allocated_data[resource_type][resource_name] = {
    resource_type: resource_type,
    resource_obj: resource_obj,
    allocated_to_type: allocated_to_type,
    allocated_to_obj: allocated_to_obj
  };

  console.log(resource_name);
  console.log(allocated_name);
  $('tr[resource_name="' + resource_name + '"] .allocated_to').html(allocated_name + ' <span class="caret"></span>');
}

function submit() {
  var data = [];
  for (var resource_type in allocated_data) {
    for (var id in allocated_data[resource_type]) {
      data.push(allocated_data[resource_type][id]);
    }
  }
  console.log(JSON.stringify(data));


  // upload format
  // [
  //   {
  //     resource_type: "vehicle"/"person",
  //     resource_obj: vehicle/person,
  //     allocated_to_type: "area"/"incident",
  //     allocated_to_obj: area/incident
  //   }
  // ]
  $.ajax({
    url: "/allocateVehicleOrPersonnel",
    type: "POST",
    data: {
      data: JSON.stringify(data)
    }
  }).done(function (data) {
    console.log(data);
    location.reload();
  }).fail(function (XHR) {
    console.log(XHR);
    alert("Allocate resource failed.");
  });
}

function unallocate(resource_type, resource_obj) {
  var data = {
    resource_type: resource_type,
    resource_obj: JSON.parse(resource_obj)
  };
  console.log(data);
  console.log(resource_obj);

  $.ajax({
    url: "/unallocateVehicleOrPersonnel",
    type: "POST",
    data: {
      data: JSON.stringify(data)
    }
  }).done(function (data) {
    console.log(data);
    location.reload();
  }).fail(function (XHR) {
    console.log(XHR);
    alert("Unallocate resource failed.");
  });
}