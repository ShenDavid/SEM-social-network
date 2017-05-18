var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pug = require('pug');
var esession = require('express-session');

// Load routest
var alerts = require('./routes/alerts');
var index = require('./routes/index');
var users = require('./routes/users');
var messages = require('./routes/messages');
var announcements = require('./routes/announcements');
var status = require('./routes/status');
var search = require('./routes/search');
var missingPeople = require('./routes/missingPeople');
var api = require('./routes/api');
var bookmark = require('./routes/bookmark');

var map = require('./routes/map');
var utility = require('./routes/UtilityLocations');
var userLoc = require('./routes/userLocation');

var group = require('./routes/group');
var incident = require('./routes/incident');
var allocateResource = require('./routes/allocateResource');
var contact = require('./routes/contact');
var connect = require('./routes/connect');
var reach911 = require('./routes/reach911');
var patrolArea = require('./routes/patrol_area');
var patient = require('./routes/patient');
var inventory = require("./routes/inventory");

var wildfireArea = require('./routes/wildfireArea');
var bedsavailable = require('./routes/bedsavailable');

var uploader = require('./routes/upload');

var ocr = require('./routes/ocr');

var organization = require('./routes/organization');
var registerHospital = require('./routes/registerHospital');
var hospitalDirectory = require('./routes/hospitalDirectory');
var hospital = require('./routes/hospital');
var findHospital = require('./routes/findHospital');
var vehicleAllocation = require('./routes/vehicleAllocation');

var config = require('./config');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//if there is a connection, set up for socket stuff
io.on('connection', function(socket){
  app.set('io', io);
});

app.set('port', process.env.PORT || 8080);

//Setup express session
app.use(esession({
    secret: config.sess_secret,
    resave: true,
    saveUninitialized: true
}));

// Routes //
//* INDEX STUFF *//
app.get('/', index.login);
app.get('/index', index.show);
//app.get('/home', index.getHome);
app.get('/logout', index.logout);

//* USERS ROUTES *//
app.get('/users', users.getAllUsers);
app.post('/users', users.postNewUser);
app.get('/users/:username', users.getUserProfile);
app.post('/users/:username', users.updateProfile);
app.post('/users/profile/:username',users.updateUserProfile);
app.get('/administer_users', users.adminProfile);

//* ALERTS *//
app.post('/alerts/newAlert', alerts.newAlert);
//app.post('/alerts/test', alerts.testRoute);
app.get('/alerts/incomingAlert/:groupName/:alertClass', alerts.showAlertPage);
//app.post('/alerts/checkUser', alerts.checkUser);

//* CONNECT ROUTES *//
app.get('/connect', connect.renderConnect);

//* MESSAGE ROUTES *//
app.get('/messages/public', messages.getAllPublicMessages);
app.post('/messages/public', messages.postNewMessage);

app.get('/messages/groups/:groupName', messages.getGroupMessages);

app.get('/messages/private/:author/:receiver', messages.getPrivateMessages);
app.post('/messages/private', messages.postNewMessage); //Using the same method as publc because there really is little difference

//* BOOKMARK ROUTES *//
app.get('/messages/bookmark/', bookmark.getMessages);
app.post('/messages/bookmark', bookmark.addBookmark);
app.post('/messages/unbookmark', bookmark.deleteBookmark);

//* Group ROUTES*//
app.get('/groups', group.getGroups);
app.get('/group', group.newOrShowGroup);
app.get('/group/:groupName', group.newOrShowGroup);
app.get('/groups/alert', group.checkGroupAlert);
app.get('/groups/:groupName/members', group.getGroupMembers);
app.get('/groups/userInGroups/:username', group.getUserInGroups);
app.post('/groups/:groupName/members', group.updateGroupMembers);
app.post('/groups/alert', group.updateAlert);
app.put('/group/', group.updateGroup);
app.post('/groups', group.createNewGroup);
app.post('/groups/:groupName/members/:groupMember',group.addGroupMember);
app.delete('/groups/:groupName',group.deleteGroup);
app.delete('/groups/:groupName/members/:groupMember',group.deleteGroupMember);

//* Incidents ROUTES *//
app.get('/incidents', incident.getIncidents);
app.get('/incident', incident.newOrShowIncident);
app.get('/incident/:incidentId', incident.newOrShowIncident);
app.post('/incidents/', incident.createOrUpdateIncident);
app.post('/incident/changeStatus/:incidentId', incident.changeStatus);
app.post('/incident/transferCommand/:incidentId', incident.transferCommand);

//* Allocate Resource ROUTES *//
app.get('/allocateResource', allocateResource.allocateResource);
app.post('/allocateVehicleOrPersonnel', allocateResource.allocateVehicleOrPersonnel);
app.post('/unallocateVehicleOrPersonnel', allocateResource.unallocateVehicleOrPersonnel);

//* ANNOUNCEMENT ROUTES *//
app.get('/messages/announcements', announcements.getAllAnnouncements);
app.post('/messages/announcements', announcements.postNewAnnouncement);
app.post('/messages/pinAnnouncement', announcements.pinAnnouncement);
app.post('/messages/unpinAnnouncement', announcements.unpinAnnouncement);

//* STATUS *//
app.post('/users/:username/status/:statusCode', status.saveStatusCrumb);
app.get('/users/:username/statuscrumbs', status.getStatusCrumbs);
app.get('/sharestatus', status.renderStatusPage );

//*SEARCH*//
app.get('/search',search.searchData);

//*MISSING PEOPLE*//
app.get('/missingPeople', missingPeople.getMissingPeople);
app.post('/missingPeople/:reporter', missingPeople.addMissingPerson);
app.post('/missingPeople/changeStatus/:foundByUser', missingPeople.changeStatus);

//*Maps*//
app.get('/map',map.viewMap);
app.get('/map/:category', utility.getUtilityLocationByCategory);
app.get('/map/user/:username', userLoc.getUserLocation);
app.get('/map/contact/:username', userLoc.getContactLocation);
app.post('/map/userlocation', userLoc.saveUserLocation);
app.post('/map/addData', utility.insertPreData);

app.post('/map/addPin', map.addPin);
app.post('/map/deletePin', map.deletePin);

app.get('/map/members/:groupname', map.getGroupMembersByGroupName);
app.get('/map/member/:username', userLoc.getMemberLocation);

app.post('/addincident', utility.saveUtilityLocation);

//*911*//
app.get('/reach911',reach911.showMap);
// app.get('/reach911-2',reach911.showEmer);
// app.get('/reach911-3',reach911.showPatient);
// app.get('/reach911-4',reach911.showMap);
app.post('/reach911/save', reach911.saveEmergency);
app.get('/reach911/dispatcher', reach911.assignDispatcher);
app.get('/reach911/count/:username', reach911.countDispatcher);

app.post('/reach911/patient', reach911.savePatient);

//*PATIENTS*//
app.get('/patients', patient.getPatients);
app.get('/patients/:id', patient.getPatientProfile);
app.post('/patients/update/:id', patient.postPatientProfile);
app.post('/patients/delete/:id', patient.deletePatientProfile);

//Patrol Area
app.get('/patrolArea', patrolArea.viewPatrolArea);
app.post('/patrolArea', patrolArea.addCoordinate);
app.post('/patrolArea/delete', patrolArea.deleteByName);

// Hospital
app.get('/hospitalDirectory', hospitalDirectory.renderHospitalDirectory);
app.get('/registerHospital', registerHospital.renderRegisterHospital);
app.get('/registerHospital/:hospitalName', registerHospital.renderRegisterHospital);
app.get('/bedsavailable', bedsavailable.renderAvailableBeds);
app.post('/bedsavailable/update', bedsavailable.updateBeds );
app.get('/hospital/getHospitalByName/:name', hospital.getHospitalByName);
app.get('/hospital/getAllHospitals', hospital.getAllHospitals);
app.post('/hospital/addUpdateHospital', hospital.addUpdateHospital);
app.post('/hospital/deleteHospital', hospital.deleteHospital);

//Patrol Area
app.get('/wildfireArea', wildfireArea.viewWildfireArea);
app.post('/wildfireArea', wildfireArea.addCoordinate);
app.post('/wildfireArea/delete', wildfireArea.deleteByName);

//*MANAGE INVENTORY*//
app.get('/inventory', inventory.getInventory);
app.get('/addItem', inventory.getItemForm);
app.post('/addItem', inventory.postItem);
app.get('/item/:itemId', inventory.getItem);
app.post('/item', inventory.updateItem);
app.get('/inventory/:username', inventory.getUserCheckoutItem);
app.get('/inventory/:username/:item_id/checkin', inventory.checkInItem);
app.get('/inventory/:username/:item_id/consume', inventory.consumeItem);
app.post('/item/checkout/:item_id', inventory.checkout);
app.post('/item/delete/:item_id', inventory.delete);

//* API ROUTES *//
//USER API
app.get('/api/users', api.getUsers);
app.post('/api/users', api.postUsers);
app.get('/api/users/:username', api.getUserProfile);
app.post('/api/users/:username', api.updateProfile);
app.get('/api/users/:username/statuscrumbs', api.getStatusCrumbs);
app.post('/api/users/:username/status/:statusCode', api.postStatusCrumb);
//MESSAGES API
app.get('/api/messages/public', api.getPublicMessages);
app.post('/api/messages/public', api.postNewMessage);
app.get('/api/messages/private/:author/:receiver', api.getPrivateMessages);
app.post('/api/messages/private', api.postNewMessage);
app.get('/api/messages/announcements', api.getAnnouncements);
app.post('/api/messages/announcements', api.postAnnouncements);
//SEARCH API
app.get('/api/search', api.searchData);
//Missing People
app.get('/api/missingPeople', api.getMissingPeople);
app.post('/api/missingPeople/:reporter', api.addMissingPerson);
app.post('/api/missingPeople/changeStatus/:foundByUser', api.changeMissingStatus);

//Data uploading
app.post('/api/upload/:datatype', uploader.uploadData);

//CONTACT API
app.get('/contacts', contact.getAllContacts);

// Organization API
app.get('/organization', organization.getOrganization);
app.post('/organization', organization.updateOrganization);
app.get('/viewOrganization', organization.viewOrganization);
app.get('/organizationChart', organization.loadOrganizationChart);
app.get('/administerOrganization', organization.loadAdministerOrganization);

//vehicleAllocation
app.get('/vehicleAllocation', vehicleAllocation.getAllVehicleAllocationInfo);
app.get('/vehicleAllocationSearch', vehicleAllocation.getMatchingVehicleAllocationInfo);
app.post('/vehicleAllocation', vehicleAllocation.updateVehicleAllocationInfo);

// FIND HOSPITAL
app.get('/findHospital', findHospital.renderFindHospitalPage );
app.post( '/findhospital/save', findHospital.saveHospitalInformation);
app.get('/testfindhospital', findHospital.testInsertPatients);

//* OCR *//
app.get('/ocr',ocr.showOcr);

//* TEST ROUTES *//
//ALWAYS DISABLED IN MASTER
//app.use('/test', test);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//Check if admin exists, if not add it
if (app.get('env') != 'test') {
  //checkAdmin and if admin dne, then add admin to db
  users.checkAdmin(function(success, msg){
    if(success){
      //checkAdmin and if admin dne, then add admin to db
      // console.log(msg);
      group.checkSystemDefinedGroups(function(success, msg){
        if(success){
          // console.log(msg);
        } else {
          console.log(msg);
        }
      });
    } else {
      console.log(msg);
    }
  });

  vehicleAllocation.initializeVehicle();

}

//LIVE SERVER, LIVEEEE!!
console.log("node environment: " + app.get('env'));

var port = app.get('port');
var server = http.listen(port , function(){
  console.log("listening on http://localhost:" + port);
});

console.log('Magic is happening on port '+port+'. \n  Now open http://localhost:'+port+'/ in your browser!');

module.exports = {
  server: server,
  app: app
};
