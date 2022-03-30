var socket;
var future_appts;

$(document).ready(function() {
	socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		console.log("Connected to the server.");
	});
    
	//hide and show for register and login 
	$(".wrapper").addClass("active");
	// $(".after_login").hide();

	$(".sign_up").hide();
	$(".sign_in_li").addClass("active");
	
	$(".sign_up_li").click(function(){
	  $(this).addClass("active");
	  $(".sign_in_li").removeClass("active");
	  $(".sign_up").show();
	   $(".sign_in").hide();
	})
	
	$(".sign_in_li").click(function(){
	  $(this).addClass("active");
	  $(".sign_up_li").removeClass("active");
	  $(".sign_in").show();
	   $(".sign_up").hide();
	})

	//Response from Register attempts
	socket.on('register_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			console.log("You have been registered successfully");
			socket.emit('login_res');
		}
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
	
	//Response to upcoming appointments request.
	socket.on('fetch_future_appointments_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			console.log("Upcoming appointments fetched.");
			future_appts = data.result;
		}
	});
});