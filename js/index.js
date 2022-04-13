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
			//$("#mbappt").show();
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

function LoginformValidation()
{
	
	var lgemail = document.getElementById("lgemail");
	var lgpass = document.getElementById("lgpass");
	if(ValidateEmail(lgemail))
	{
		if(pass_validation(lgpass,7,20))
		   { } }
	return false;
}

function RegisterformValidation()
{
var rfirstname = document.getElementById("rfirstname");
var rmiddlename = document.getElementById("rmiddlename");
var rlastname = document.getElementById("rlastname");

var rdateofbirth = document.getElementById("rdateofbirth");
var rssn = document.getElementById("rssn");

var rstreetn = document.getElementById("rstreetn");
var rstreetname = document.getElementById("rstreetname");
var rcity = document.getElementById("rcity");
var rprovince = document.getElementById("rprovince");

var remail = document.getElementById("remail");
var rpass = document.getElementById("rpass");
var rpassconf = document.getElementById("rpassconf");
var rphone = document.getElementById("rphone");


if(allLetter(rfirstname) && allLetter(rlastname) && allLetter(rmiddlename) && allLetter(rstreetname) 
&& allLetter(rcity) && allLetter(rprovince) )
{
if(dateofbirth_validation(rdateofbirth))
{
if(allnumeric(rssn) && allnumeric(rstreetn))
{	
if(ValidateEmail(remail))
{
if(pass_validation(rpass,7,20) )
{
if(passconf_validation(rpass, rpassconf))
{ 
if(phone_validation(rphone))
{ 	
}} }} }} }
return false;
}

function dateofbirth_validation(rdateofbirth)
{
	var regex = /(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/;
 
        //Check whether valid dd/MM/yyyy Date Format.
        if (regex.test(rdateofbirth)) {
            var parts = rdateofbirth.split("/");
            var dtDOB = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
            var dtCurrent = new Date();
        
            if (dtCurrent.getFullYear() - dtDOB.getFullYear() < 18) {
                return false;
            }
 
            if (dtCurrent.getFullYear() - dtDOB.getFullYear() == 18) {
                if (dtCurrent.getMonth() < dtDOB.getMonth()) {
                    return false;
                }
                if (dtCurrent.getMonth() == dtDOB.getMonth()) {
                    
                    if (dtCurrent.getDate() < dtDOB.getDate()) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            alert("Enter date in dd/MM/yyyy format ONLY.");
			rdateofbirth.focus();
            return false;
        }
}

function allnumeric(x)
{ 
var numbers = /^[0-9]+$/;
if(x.value.match(numbers))
{
return true;
}
else
{
alert('SSN and street No must have numeric characters only');
return false;
}
}
function pass_validation(passid,mx,my)
{
var passid_len = passid.value.length;
if (passid_len == 0 ||passid_len >= my || passid_len < mx)
{
alert("Password should not be empty / length be between "+mx+" to "+my);
passid.focus();
return false;
}
return true;
}

function allLetter(uname)
{ 
var letters = /^[A-Za-z]+$/;
if(uname == null) {
	alert('Firstname, lastName,middle name, city, province and street name must have alphabet characters only');
	uname.focus();
	return false;
}
if(uname.value.match(letters))
{
return true;
}
else
{
alert('Firstname, lastName,middle name, city, province and street name must have alphabet characters only');
uname.focus();
return false;
}
}


function ValidateEmail(remail)
{
var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
if(remail.value.match(mailformat))
{
return true;
}
else
{
alert("You have entered an invalid email address!");
remail.focus();
return false;
}
}

function passconf_validation(rpass, rpassconf) {
	if(rpass == rpassconf) {
		return true;
	}
	else{
		alert("The two passwords entered are different");
	}

}

function phone_validation(rphone) {
	var re = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;

	if(re.test(rphone)) {
		return true
	}
	else{
		alert("You have entered an invalid phone number");
	};
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