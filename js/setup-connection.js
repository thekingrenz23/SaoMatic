var ws;
var log = document.getElementById('chat-log');
var connection = {
    init: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		document.addEventListener('resume', this.onResume.bind(this), false);
		document.addEventListener('backbutton', this.back.bind(this), false);
    },
    onDeviceReady: function() {
		this.check();
		
		load("Connecting..");
		ws = new WebSocket('ws://'+localStorage.getItem("address"));
		
		ws.onopen = function (event) { 
			stop_load();
			
			//new code
			var config = {
				isInitiator: true,
				streams: {
					audio: true,
					video: false
				}
			}

			connection.session = new cordova.plugins.phonertc.Session(config);
			
			connection.session.on('sendMessage', function (data) { 
				ws.send(JSON.stringify(data));
			});
			
			connection.session.on('answer', function () { 
				alert("other client answered");
			});
			
			setTimeout(function(){
				connection.session.call();
			},1000);
		}
		
		ws.onerror = function(event) {
			stop_load();
			notify("Unable to connect");
			window.location = "setup-ip.html";
		};
		
		ws.onclose = function(event) {
			stop_load();
			notify("Unable to connect");
			window.location = "setup-ip.html";
		};
		
		ws.onmessage = function(event) {
			log.innerHTML += `<div class="rep bubble"><i class="material-icons left circle sample">account_circle</i>: ${event.data}</div>`;
			connection.session.receiveMessage(JSON.parse(event.data));
		};
    },
	onResume: function(){
		this.check();
	},
	back: function(e){
		e.preventDefault();
	},
	send: function(){
		var message = document.getElementById('message-data').value;
		log.innerHTML +=`<div class="bubble"><i class="material-icons left circle sample">account_circle</i>: ${message}</div>`;
		ws.send(message);
		document.getElementById('message-data').value = "";
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
							 connection.onConfirm,            
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
				 connection.onConfirm,            
				'SAO-MATIC',           
				['open setting','exit']     
			);
		}
	}
};

connection.init();