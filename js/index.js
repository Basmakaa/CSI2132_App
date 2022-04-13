var socket;
var future_appts;
var user_info;
var dentist_apps;
var phone_counter = 0;

$(document).ready(function() {
	//jQuery UI Setup
	$("#bappt_date").datepicker();
	
	//Socket
	socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		console.log("Connected to the server.");
	});

	//Response from login attempts
	socket.on('login_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			$("#navbar h1").text("Hello " + data.name + "!");
			$("#mlogin").hide();
			$("#mregister").hide();
			$("#muinfo").show();
			$("#mbappt").show();
			$("#muinfo").click();
			
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
	
	socket.on('get_user_info_res', function(data) {
        if(data.status == 'error') console.log(data.reason);
        else{    
            console.log("User info fetched.");
            user_info = data.result;
        }
    });

    socket.on('fetch_dentist_appointments_res', function(data) {
        if(data.status == 'error') console.log(data.reason);
        else{    
            console.log("Dentist appointments fetched.");
            dentist_apps = data.result;
        }
    });
});

function swapTo(section, btn){
	$("#main section").hide();
	$("#"+section).show();
	$(".active").removeClass("active");
	$(btn).addClass("active");
}

function addPhone(btn){
	if(++phone_counter < 4){
		$(btn).after("<br><input type=\"password\" placeholder=\"123-456-7890\" class=\"input\"> <button class=\"small\" onclick=\"addPhone(this);\">+</button>");
		if(phone_counter >= 3) $("#register button.small").remove();
	}
}

function login(){
	socket.emit('login', {email: $("#lgemail").val(), password: $("#lgpass").val()});
}

function register(){
	
}

function book_appt(){
	var branch = $("#bappt_branch").val();
	var type = $("#bappt_type").val();
	var date = Date.parse($("#bappt_date").val() + ' ' + $("#bappt_time").val());
	var time = $("#bappt_time").val();
	
	console.log(branch);
	console.log(type);
	console.log(date);
	console.log(time);
	
	console.log(Date.now() < date);
}