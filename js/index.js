var socket;
var future_appts;
var user_info;
var dentist_apps;
var phone_counter = 0;

$(document).ready(function() {
	//jQuery UI Setup
	$("#rdateofbirth").datepicker({
        maxDate: new Date(),
		changeMonth: true,
		changeYear: true
    });
	$("#bappt_date").datepicker({
        minDate: new Date()
    });
	
	registerUserTypeUpdate();
	
	//Socket
	socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		console.log("Connected to the server.");
	});

	//Response from login attempts
	socket.on('login_res', function(data) {
		if(data.status == 'error') toastNotify(data.reason);
		else{	
			var udata = data.user;
			var pdata = data.patient;
			var edata = data.employee;
			
			$("#navbar h1").text("Hello, " + udata.first_name + " " + udata.last_name + "!" + (edata ? " (" + edata.branch_city + " Branch)" : ""));
						
			toastNotify("Logged in successfully");
			$("#muserinfo").show();
			$("#muserinfo").click();
			$("#mlogin").hide();
			$("#mregister").hide();
			
			if(pdata){
				
				$("#mrecords").show();
				$("#mappts").show();
				
				if(calcAge(Date.parse(udata.date_of_birth)) >= 15){
					$("#mreview").show();
					$("#mbookappt").show();
					$("#minvoices").show();
					$("#minsure").show();
				}
			} 

			if(edata){
				switch(edata.employee_type){
					case "dentist":
						$("#mappts").show();
						$("#mpatients").show();
						$("#mtreatmnt").show();
						break;
						
					case "hygienist":
						$("#mpatients").show();
						$("#mtreatmnt").show();
						break;
						
					case "receptionist":
						$("#mpatients").show();
						$("#mschdappt").show();
						$("#mbookappt").show();
						$("#mtreatmnt").show();
						$("#mcharges").show();
						$("#mregister").show();
						break;
						
					case "branch manager":
						$("#memployees").show();
						$("#mcharges").show();
						$("#mregister").show();
						break;
				}
			}
			
			if(udata.user_id < 0){
				$("#mregister").show();
				//todo
			}
		}
	});
	
	//Response from Register attempts
	socket.on('register_res', function(data) {
		if(data.status == 'error') toastNotify(data.reason);
		else{	
			toastNotify("Account registered succesfully");
			socket.emit('login', {email: data.email, password: data.password});
		}
	});  
	
	//All-purpose event for notifications from the server
	//(you probably don't want to use this!)
	socket.on('inform', function(data){
		console.log(data.info);
		toastNotify(data.info);
	});
	
	//Response to upcoming appointments request.
	socket.on('fetch_future_appointments_res', function(data) {
		if(data.status == 'error') toastNotify(data.reason);
		else{	
			console.log("Upcoming appointments fetched.");
			console.log(data.result);
			future_appts = data.result;
		}
	});
	
	socket.on('get_user_info_res', function(data) {
        if(data.status == 'error') toastNotify(data.reason);
        else{    
            console.log("User info fetched.");
            user_info = data.result;
        }
    });

    socket.on('fetch_dentist_appointments_res', function(data) {
        if(data.status == 'error') toastNotify(data.reason);
        else{    
            console.log("Dentist appointments fetched.");
            dentist_apps = data.result;
        }
    });

    socket.on('add_user_review_res', function(data) {
        if(data.status == 'error') console.log(data.reason);
        else{    
            console.log("Added user review.");
        }
    });
});

function toastNotify(txt){
	$("#toast").text(txt);
	$("#toast").finish().show().delay(4000).fadeOut("slow");
}

function swapTo(section, btn){
	$("#main section").hide();
	$("#"+section).show();
	$(".active").removeClass("active");
	$(btn).addClass("active");
}

function registerUserTypeUpdate(){
	if($("#rtype").val() == "patient") $("#rpatientinfo").show();
	else $("#rpatientinfo").hide();
}

function calcAge(date){
	return new Date(Date.now() - date).getUTCFullYear() - 1970;
}

function addPhone(btn){
	if(++phone_counter < 4){
		$(btn).after("<br><input type=\"text\" placeholder=\"123-456-7890\" class=\"phone\"> <button class=\"small\" onclick=\"addPhone(this);\">+</button>");
		if(phone_counter >= 3) $("#register button.small").remove();
	}
}

function valEmail(email){
	if($(email).val().match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/))
		return true;

	toastNotify("Invalid email address");
	email.focus();
	return false;
}

function valPassword(password){
	var passid_len = $(password).val().length;
	if (passid_len >= 7 && passid_len <= 20)
		return true;
	
	toastNotify("Password length should be between 7 and 20");
	password.focus();
	return false;
}

function valAlpha(name){ 
	if($(name).val().match(/^[A-Za-z]+$/))
		return true;
	
	toastNotify('Letters-only value expected');
	name.focus();
	return false;
}

function login(){
	toastNotify("Please wait...");
	var lgemail = $("#lgemail");
	var lgpass = $("#lgpass");
	
	if(valEmail(lgemail) && valPassword(lgpass))
		socket.emit('login', {email: lgemail.val(), password: lgpass.val()});
}

function register(){
	var rtype = $("#rtype").val();
	var rfirstname = $("#rfirstname");
	var rmiddlename = $("#rmiddlename");
	var rlastname = $("#rlastname");
	var rdateofbirth = $("#rdateofbirth");
	var rssn = $("#rssn");
	var rstreetn = $("#rstreetn");
	var rstreetname = $("#rstreetname");
	var rcity = $("#rcity");
	var rprovince = $("#rprovince");
	var remail = $("#remail");
	var rpass = $("#rpass");
	var rpassconf = $("#rpassconf");
	var rinsurance = $("#rinsurance");
	var rgender = $("#rgender").val();

	if(rtype == "patient" && calcAge(Date.parse(rdateofbirth.val())) < 15){
		toastNotify('Registering for users under 15 is a WIP feature.');
		rdateofbirth.focus(); //TODO: change this the guardian SSN thing
		return;
	}
	
	if(!rssn.val().match(/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/)){ 
		toastNotify('SSNs must be of the format 012-34-5678');
		rssn.focus();
		return;
	}
	
	if(!rstreetn.val().match(/^[0-9]+$/)){
		toastNotify('Numeric value expected');
		rstreetn.focus();
		return;
	}
	
	if(rpass.val() != rpassconf.val()){
		toastNotify('Passwords do not match');
		rpassconf.focus();
		return;
	}
	
	//patient-specific validation
	if(rtype == "patient"){
		if(!rinsurance.val().match(/^[A-Za-z0-9\s]+$/)){
			toastNotify('No special characters expected.');
			rinsurance.focus();
			return;
		}
	}
	
	//validates each phone number
	var failed = false;
	$(".phone").each(function(){
		if($(this).val() != "" && !$(this).val().match(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)){
			toastNotify("Invalid phone number");
			$(this).focus();
			failed = true; //can't return here, we're inside an anonymous funct.
		}
	}); if(failed) return;
	
	//put each value in an array
	var rphones = $(".phone").map(function(){
		return $(this).val() == "" ? null : $(this).val();
	}).get();

	if(valAlpha(rfirstname) && valAlpha(rlastname) && (rmiddlename.val() == "" || valAlpha(rmiddlename)) 
		&& valAlpha(rstreetname) && valAlpha(rcity) && valAlpha(rprovince)
		&& valEmail(remail) && valPassword(rpass)){
		socket.emit('register', {type: rtype, fname: rfirstname.val(), mname: rmiddlename.val(), lname: rlastname.val(), 
								 dob: rdateofbirth.val(), ssn: rssn.val(), streetn: rstreetn.val(), street: rstreetname.val(), 
								 city: rcity.val(), prov: rprovince.val(), email: remail.val(), password: rpass.val(), phones: rphones,
								 insur: rinsurance.val(), gender: rgender});
	}
}

function sendReview () {
	socket.emit('add_user_review', {professionalism: $("#review_prof").val()/100, //known issue: divisions become 0 instead of null when the initial value is null
								    communication: $("#review_comm").val()/100, 
									cleanliness: $("#review_clea").val()/100, 
									overall: $("#review_over").val()/100, 
									branch: $("#review_branch").val(), 
									comments: $("#review_comment").val()})
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



