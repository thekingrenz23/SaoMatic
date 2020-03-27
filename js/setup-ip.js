var setUpIP = {
	init: function(){
		document.addEventListener('deviceready', this.ready.bind(this), false);
		document.addEventListener('resume', this.resume.bind(this), false);
		document.addEventListener('backbutton', this.back.bind(this), false);
	},
	ready: function(){
		this.check();
	},
	resume: function(){
		this.check();
	},
	back: function(e){
		e.preventDefault();
	},
	connect: function(){
		load("Connecting..");
		var ip = document.getElementById('ip').value;
		var port = document.getElementById('port').value;
		
		var addr = ip+":"+port;
		localStorage.setItem("address", addr);
		window.location = "setup-connection.html";
	},
	check: function(){
		if(navigator.connection.type == "wifi"){
			WifiWizard.isWifiEnabled(
				function(res){				
					if(!res){
						navigator.notification.confirm(
							'Wifi connection required', 
							 setUpIP.onConfirm,            
							'SAO-MATIC',           
							['open setting','exit']     
						);
					}
				},
				function(){
					notify("Error checking wifi status");
				}
			);
		}else{
			navigator.notification.confirm(
				'Pls. connect to a network', 
				 setUpIP.onConfirm,            
				'SAO-MATIC',           
				['open setting','exit']     
			);
		}
	},
	onConfirm: function(btnIndex){
		if(btnIndex == 1){
			window.cordova.plugins.settings.open(
				"wifi", 
				function() {
					
				},
				function () {
					notify('failed to open settings');
				}
			);
		}else{
			navigator.app.exitApp();
		}
	}
}

setUpIP.init();