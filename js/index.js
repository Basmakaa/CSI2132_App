$(document).ready(function() {
	var socket = io.connect('https://csi2132-group12.herokuapp.com/');
	
	alert("test");
	
	socket.on('connect', function(){
		
		socket.emit('mycoolevent', {myattribute: 15});
				
	});
});