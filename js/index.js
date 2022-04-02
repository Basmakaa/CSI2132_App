var socket;
var future_appts;

$(document).ready(function() {
	socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		console.log("Connected to the server.");
	});

	//Response from login attempts
	socket.on('login_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			console.log("Logged in as " + data.name + ".");
			
			//Fetch upcoming appointments.
			//Note: could be replaced in the future with a general funct. to retrieve all data necessary to be displayed post-login.
			socket.emit('fetch_future_appointments');
		}
	});
	
	//Response from Register attempts
	socket.on('register_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			console.log("You have been registered successfully");
			socket.emit('login_res');
		}
	});  
	
	//Response to upcoming appointments request.
	socket.on('fetch_future_appointments_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			console.log("Upcoming appointments fetched.");
			future_appts = data.result;
		}
	});
});

function swapTo(section, btn){
	$("#main section").hide();
	$("#"+section).show();
	$(".active").removeClass("active");
	$(btn).addClass("active");
}

function login(){
	socket.emit('login', {email: $("#lgemail").val(), password: $("#lgpass").val()});
}

function register(){
	
}