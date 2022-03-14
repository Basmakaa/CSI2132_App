$(document).ready(function() {
	var socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		alert("connected");
		socket.emit('mycoolevent', {myattribute: 15});	
	});
});