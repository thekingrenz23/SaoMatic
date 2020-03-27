function load(message){
	var options = { dimBackground: true };
	SpinnerPlugin.activityStart(message, options);
}

function stop_load(){
	SpinnerPlugin.activityStop();
}

function notify(message){
	navigator.notification.alert(
		message,  
		function(){},         
		"SAO-MATIC",            
		'ok'                  
	);
}