var index = {
    init: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		document.addEventListener('resume', this.onResume.bind(this), false);
		document.addEventListener('backbutton', this.back.bind(this), false);
    },
    onDeviceReady: function() {
		this.check();
		
		console.log("Yeey");
		
		document.getElementById('connect').addEventListener('click',function(){
			window.location="setup-ip.html";
		});
		
		document.getElementById('create').addEventListener('click',function(){
			window.location="setup-server.html";
		});
		
    },
	onResume: function(){
		this.check();
	},
	back: function(e){
		e.preventDefault();
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
	},
	check: function(){
		if(navigator.connection.type == "wifi"){
			WifiWizard.isWifiEnabled(
				function(res){				
					if(!res){
						navigator.notification.confirm(
							'Wifi connection required', 
							 index.onConfirm,            
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
				 index.onConfirm,            
				'SAO-MATIC',           
				['open setting','exit']     
			);
		}
	}
};

index.init();