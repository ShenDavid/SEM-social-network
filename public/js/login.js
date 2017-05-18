
// salt is sent from the server
// this function creates a key using PBKDF2 with password and salt
// then uses AES to encrypt the password to send to server
function encrypt(password, salt){
	var key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), { keySize: 256/32, iterations: 1000 }).toString();
	var iv = CryptoJS.lib.WordArray.random(256/8).toString();
	var ciphertext = CryptoJS.AES.encrypt(password, key, {iv: iv}).toString();

	return {key: key, iv: iv, ciphertext: ciphertext};
}

// this function verifies the length of the username and password. If both are appropriate,
// then it would send these parameters to the server to determine whether to create a new user or
// sign in the existing one
function verify() {
	console.log("in verify");

	var message1 = "Please choose a different username. Length of username must be at least 3 characters";
	var message2 = "Please choose a different password. Length of password must be at least 4 characters";
	var message3 = "Please choose a different username. This username is banned";
	var message4 = "Username and Password do not match";

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

	var salt = document.getElementById("loginButton").getAttribute("rel");
	var pw = encrypt(password, salt);

	console.log("username is " + username);
	console.log("password is " + password);
	console.log("ciphertext is " + pw.ciphertext);
	var username_error = document.getElementById("username_error");
	var password_error = document.getElementById("password_error");

	//reset errors
	username_error.innerHTML = "";
	password_error.innerHTML = "";

	var errors = false;
	if (username.length < 3){
		username_error.innerHTML = message1;
		errors = true;
	}
	if (password.length < 4) {
		password_error.innerHTML = message2;
		errors = true;
	}

	if (!errors) {
	//if there is no error, send data to server to either log in or create new user
		$.ajax({
      url: "/users",
      data: {
      	username : username,
				ciphertext: pw.ciphertext,
				key : pw.key,
				iv : pw.iv,
      	isCreate : false,
      },
      type : "POST",
      dataType : "json",
      statusCode: {
				422: function(errors) {
					console.log("Error 422!");
					var err_list = JSON.parse(errors.responseText).errors;
					if (err_list.usernameLenInvalid) username_error.innerHTML = message1;
					if (err_list.usernameBanned) username_error.innerHTML = message3;
					if (err_list.passwordLenInvalid) password_error.innerHTML = message2;
				},
				401: function() {
					console.log("Password Mismatch");
					username_error.innerHTML = message4;
				},
				404: function() {
					console.log("User not found. Create a new one?");
					document.getElementById("login_form").style.display = "none";
					var createUserConfirmation = document.createElement('div');
					createUserConfirmation.className = "panel-body";
					createUserConfirmation.innerHTML = "<h3>Create new account?</h3><a onclick='createUser()' class='btn btn-primary'>Submit</a>&nbsp<a href='' class='btn btn-primary'>Cancel</a>";
					document.getElementById("login_panel").appendChild(createUserConfirmation);
				},
				405: function() {
					console.log("User is deactivated");
					window.location.href = "/?deactivate=1";
				},
				200: function() {
					console.log("Existing user logged in");
					window.location.href = "/index";
				},
				201: function() {
					console.log("New user logged in");
					window.location.href = "/index";
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

}

//this function is ecxecuted once the user opts to create a new account. It sends
//the username, password and a variable that indicates that a new account is to be
//created to the server. When the server returns that the account has been successfully created,
//the user is directed to the home page
function createUser(){
	console.log("in create new user on client side");

	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

	var salt = document.getElementById("loginButton").getAttribute("rel");
	var pw = encrypt(password, salt);

	$.ajax({
    url: "/users",
    data: {
			username : username,
			ciphertext: pw.ciphertext,
			key : pw.key,
			iv : pw.iv,
			isCreate : true,
    },
    type : "POST",
    dataType : "json",
    success: function() {
        console.log("In createUser(), client received from server. ");
        window.location.href = "/index?justCreated=true";
    },
    error: function(error){
        console.log("error in ajax: " + error);
    }
  });
}
