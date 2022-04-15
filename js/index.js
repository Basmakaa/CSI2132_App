var socket;
var logged_in = false;

$(document).ready(function() {
	//jQuery UI Setup
	$("#rdateofbirth").datepicker({
        maxDate: new Date(),
		changeMonth: true,
		changeYear: true
    });
	$("#bappt_date").datepicker({
        minDate: new Date(new Date().setDate(new Date().getDate() + 2)),
		changeMonth: true
    });
	
	registerUserTypeUpdate();
	registerUserAgeUpdate();
	
	//Socket
	socket = io.connect('https://csi2132-group12.herokuapp.com/');
		
	socket.on('connect', function(){
		console.log("Connected to the server.");
	});

	//Response from login attempts
	socket.on('login_res', function(data) {
		$("#lgbtn").prop("disabled", false);
		if(data.status == 'error') toastNotify(data.reason);
		else{	
			var udata = data.user;
			var pdata = data.patient;
			var edata = data.employee;
			
			$("#navbar h1").text("Hello, " + udata.first_name + " " + udata.last_name + "!" + (edata ? " (" + edata.branch_city + " Branch)" : ""));
			logged_in = true;			
			toastNotify("Logged in successfully");
			$("#muserinfo").show();
			$("#muserinfo").click();
			$("#mlogin").hide();
			$("#mregister").hide();
			
			$("#user_info").append("<h1>User Info</h1>"
							     + "<b>Name</b>: " + udata.first_name + " " + udata.middle_name + " " + udata.last_name + "<br>"
								 + "<b>Email</b>: " + udata.email + "<br>"
								 + "<b>Address</b>: " + udata.street_number + " " + udata.street + ", " + udata.city + ", " + udata.province + "<br>"
								 + "<b>SSN</b>: " + udata.ssn + "<br>"
								 + "<b>Date of Birth</b>: " + udata.date_of_birth.substring(0, 10) 
								 + "<br><br>");
			
			if(pdata){
				$("#user_info").append("<h1>Patient Info</h1>"
							     + "<b>Gender</b>: " + pdata.gender + "<br>"
								 + "<b>Insurance Provider</b>: " + pdata.insurance_provider + "<br><br>");
				
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
				$("#user_info").append("<h1>Employee Info</h1>"
							     + "<b>Job</b>: " + fixCaps(edata.employee_type) + "<br>"
								 + "<b>Salary</b>: " + edata.salary + "$<br>"
								 + "<b>Branch</b>: " + edata.branch_city + " Office<br><br>");
								 
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
		else if(data.status == 'guardianerror'){
			$("#rguardian").focus();
			toastNotify("Guardian SSN does not match an existing user");
			
		} else{	
			toastNotify("Account registered succesfully");
			
			if(!logged_in) socket.emit('login', {email: data.email, password: data.password});
		}
	});  
	
	//Response from Phone list update attempts
	socket.on('update_phones_res', function(data) {
		$("#user_info button").prop("disabled", false);
		if(data.status == 'error') toastNotify(data.reason);
		else toastNotify("Phone list updated succesfully");	
	});  
	
	socket.on('book_appt_res', function(data) {
        if(data.status == 'error') toastNotify(data.reason);
        else toastNotify("Appointment booked");
    });

    socket.on('add_user_review_res', function(data) {
        if(data.status == 'error') console.log(data.reason);
        else toastNotify("Added user review");
        
    });
	
	//Response to invoice request.
	// socket.on('fetch_invoice_res', function(data) {
	// 	if(data.status == 'error') console.log(data.reason);
	// 	else{	
	// 		console.log("invoices fetched.");
	// 		data.result;
	// 		for(invoice in data.result){
	// 			console.log(invoice.Date);
	// 		}
	// 	}
		
	// });
	
	//All-purpose event for notifications from the server
	//(you probably don't want to use this!)
	socket.on('inform', function(data){
		toastNotify(data.info);
	});
	
	//Post-login branch list fetching complete
	socket.on('fetched_branches', function(data){
		for(branch of data.res)
			$("select").append("<option value=\"" + branch.branch_city + "\">" + branch.branch_city + "</option>");
	});
	
	//Post-login phone number list fetching complete
	socket.on('fetched_phone_numbers', function(data){
		$("#user_info").append("<h1>Phone Numbers</h1>");
		if(data.res.length == 0){
			$("#user_info").append("<input type=\"text\" placeholder=\"123-456-7890\" class=\"phone\">"
									 + "<button class=\"small adder\" onclick=\"addPhone(this, 'user_info');\">+</button>"
									 + "<button class=\"small remover\" onclick=\"removePhone(this, 'user_info');\"  style=\"display:none\">-</button>"
									 + "<br>");
		} else {
			for(number of data.res)
				$("#user_info").append("<input type=\"text\" placeholder=\"123-456-7890\" class=\"phone\" value=\""+ number.phone_number +"\">"
									 + "<button class=\"small adder\" onclick=\"addPhone(this, 'user_info');\">+</button>"
									 + "<button class=\"small remover\" onclick=\"removePhone(this, 'user_info');\"  style=\"display:none\">-</button>"
									 + "<br>");
			if(data.res.length > 1) $("#user_info .remover").show();
			if(data.res.length >= 4) $("#user_info .adder").hide();
		}
		$("#user_info").append("<button onclick=\"updatePhones(this)\" >Update</button>");
	});
	
	socket.on('fetched_guardianships', function(data){
		if(data.res.length > 0){
			$("#user_info").append("<h1>Guardianships</h1>");
			for(g of data.res)
				$("#user_info").append(g.first_name + " " + g.middle_name + " " + g.last_name + " (age " + calcAge(Date.parse(g.date_of_birth)) + ")<br>");
			$("#user_info").append("<br>");
		}
	});
	
	socket.on('fetched_records', function(data){
		if(data.res.length > 0){
			for(r of data.res)
				$("#records_table").append("<tr><td><h1>"+r.details+"</h1>— <i>Dr. "+r.last_name+"</i>  ("+r.appointment_type+" Appointment from "+r.date.substring(0, 10)+")</td></tr>");
		} else 
			$("#records").append("No appointment records so far.");
	});
	
	socket.on('fetched_patient_appts', function(data){
		var upcoming = data.res.filter(appt => appt.date != null && Date.now() - Date.parse(appt.date.substring(0, 10) + " " + appt.start_time) < 0);
		var unscheduled = data.res.filter(appt => appt.date == null);
		var past = data.res.filter(appt => appt.date != null && Date.now() - Date.parse(appt.date.substring(0, 10) + " " + appt.start_time) >= 0);

		if(upcoming.length > 0){
			$("#appts_text").remove();
			$("#appts_upcoming_text").remove();
			$("#appts_upcoming").remove();
			$("#appts").append("<h1 id=\"appts_upcoming_text\">Upcoming Appointments</h1>");
			$("#appts").append("<table id=\"appts_upcoming\"></table>");
			for(appt of upcoming)
				$("#appts_upcoming").append("<tr><td><h1>"+appt.date.substring(0, 10)+" ("+appt.start_time.substring(0, 5)+"-"+appt.end_time.substring(0, 5)+")</h1>"+appt.appointment_type+" with Dr. "+appt.last_name+"<br>"+appt.branch_city+" Office <i>(room "+appt.room+")</i><br>"+fixCaps(appt.status)+"</td></tr>");
		}
		
		if(unscheduled.length > 0){
			$("#appts_text").remove();
			$("#appts_unsched_text").remove();
			$("#appts_unsched").remove();
			$("#appts").append("<h1 id=\"appts_unsched_text\">Unscheduled Appointments</h1>");
			$("#appts").append("<table id=\"appts_unsched\"></table>");
			for(appt of unscheduled)
				$("#appts_unsched").append("<tr><td><b>"+appt.appointment_type+"</b><br>"+appt.branch_city+" Office<br>"+fixCaps(appt.status)+"</td></tr>");
		}
		
		if(past.length > 0){
			$("#appts_text").remove();
			$("#appts_past_text").remove();
			$("#appts_past").remove();
			$("#appts").append("<h1 id=\"appts_past_text\">Past Appointments</h1>");
			$("#appts").append("<table id=\"appts_past\"></table>");
			for(appt of past)
				$("#appts_past").append("<tr><td><h1>"+appt.date.substring(0, 10)+" ("+appt.start_time.substring(0, 5)+"-"+appt.end_time.substring(0, 5)+")</h1><b>"+appt.appointment_type+"</b> with Dr. "+appt.last_name+"<br>"+appt.branch_city+" Office <i>(room "+appt.room+")</i><br>"+fixCaps(appt.status)+"</td></tr>");
		}
	});
});

function toastNotify(txt){
	console.log("Toast: " + txt);
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
	registerUserAgeUpdate();
}

function registerUserAgeUpdate(){
	if($("#rtype").val() == "patient" && calcAge(Date.parse($("#rdateofbirth").val())) < 15) $("#rguardianinfo").show();
	else $("#rguardianinfo").hide();
}

function calcAge(date){
	return new Date(Date.now() - date).getUTCFullYear() - 1970;
}

function fixCaps(string){
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function addPhone(btn, section){
	if($("#" + section + " .phone").length < 4){
		$("#" + section + " .remover").show();
		$(btn).next().after("<br><input type=\"text\" placeholder=\"123-456-7890\" class=\"phone\">"
		                   +"<button class=\"small adder\" onclick=\"addPhone(this, '" + section + "');\">+</button>"
		                   +"<button class=\"small remover\" onclick=\"removePhone(this, '" + section + "');\">-</button>");
						   
		if($("#" + section + " .phone").length >= 4) $("#" + section + " .adder").hide();
	}
}

function removePhone(btn, section){
	if($("#" + section + " .phone").length > 1){
		$("#" + section + " .adder").show();
		$(btn).prev().prev().prev().remove();
		$(btn).prev().prev().remove();
		$(btn).prev().remove();
		$(btn).remove();
		
		if($("#" + section + " .phone").length <= 1) $("#" + section + " .remover").hide();
	} 
}

function valCollectPhones(section){
	//validates each phone number
	var failed = false;
	$("#"+section+" .phone").each(function(){
		if($(this).val() != "" && !$(this).val().match(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)){
			toastNotify("Invalid phone number");
			$(this).focus();
			failed = true; //can't return here, we're inside an anonymous funct.
		}
	}); if(failed) return null;
	
	//put each value in an array & return it
	rphones = $("#"+section+" .phone").map(function(){
		return $(this).val() == "" ? null : $(this).val();
	}).get();
	
	return rphones;
}

function updatePhones(btn){
	var rphones = valCollectPhones("user_info");
	console.log(rphones);
	if(rphones != null){
		socket.emit('update_phones', {phones: rphones});
		toastNotify("Please wait...");
		$(btn).prop("disabled", true);
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
	
	if(valEmail(lgemail) && valPassword(lgpass)){
		$("#lgbtn").prop("disabled", true);
		socket.emit('login', {email: lgemail.val(), password: lgpass.val()});
	}		
}

function register(){
	var rtype =        $("#rtype").val();
	var rfirstname =   $("#rfirstname");
	var rmiddlename =  $("#rmiddlename");
	var rlastname =    $("#rlastname");
	var rdateofbirth = $("#rdateofbirth");
	var rssn =         $("#rssn");
	var rstreetn =     $("#rstreetn");
	var rstreetname =  $("#rstreetname");
	var rcity =        $("#rcity");
	var rprovince =    $("#rprovince");
	var remail =       $("#remail");
	var rpass =        $("#rpass");
	var rpassconf =    $("#rpassconf");
	var rinsurance =   $("#rinsurance");
	var rgender =      $("#rgender").val();
	var rguardian =    null;

	if(rtype == "patient" && calcAge(Date.parse(rdateofbirth.val())) < 15){
		rguardian = $("#rguardian");
		if(!rguardian.val().match(/^[0-9]{3}-[0-9]{2}-[0-9]{4}$/)){
			toastNotify('SSNs must be of the format 012-34-5678');
			rguardian.focus();
			return;
		}
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
	
	var rphones = valCollectPhones('register');

	if(valAlpha(rfirstname) && valAlpha(rlastname) && (rmiddlename.val() == "" || valAlpha(rmiddlename)) 
		&& valAlpha(rstreetname) && valAlpha(rcity) && valAlpha(rprovince) 
		&& valEmail(remail) && valPassword(rpass) && rphones != null){
		socket.emit('register', {type: rtype, fname: rfirstname.val(), mname: rmiddlename.val(), lname: rlastname.val(), 
								 dob: rdateofbirth.val(), ssn: rssn.val(), streetn: rstreetn.val(), street: rstreetname.val(), 
								 city: rcity.val(), prov: rprovince.val(), email: remail.val(), password: rpass.val(), phones: rphones,
								 insur: rinsurance.val(), gender: rgender, guardian: rguardian.val()});
	}
}

function sendReview () {
	socket.emit('add_user_review', {professionalism: $("#review_prof").val()/100, //known issue: divisions become 0 instead 
								    communication: $("#review_comm").val()/100,   //of null when the initial value is null
									cleanliness: $("#review_clea").val()/100, 
									overall: $("#review_over").val()/100, 
									branch: $("#review_branch").val(), 
									comments: $("#review_comment").val()})
}

function book_appt(){
	var babranch = $("#bappt_branch").val();
	var batype =   $("#bappt_type option:selected").text();
	var badate =   $("#bappt_date").val();
	var batime =   $("#bappt_time").val();
	
	socket.emit('book_appt', {branch: babranch, type: batype, date: badate, time: batime});
}

function invoice(){
	socket.emit('fetch_invoice');
}