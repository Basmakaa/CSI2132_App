var socket;

$(document).ready(function() {
	socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		console.log("Connected to the server.");
		//socket.emit('mycoolevent', {myattribute: 15});	
	});
	
	socket.on('login_res', function(data) {
		if(data.status == 'error') console.log(data.reason);
		else{	
			console.log("I logged in!");
		}
	});
});