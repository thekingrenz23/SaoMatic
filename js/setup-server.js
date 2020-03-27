var element = document.getElementById('chat-log');
var user;
var wsserver;
var permissions;

var server = {
    init: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		document.addEventListener('resume', this.onResume.bind(this), false);
		document.addEventListener('backbutton', this.back.bind(this), false);
    },
    onDeviceReady: function() {
		permissions = cordova.plugins.permissions;
		
		this.check();
		
		this.create();
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
	},
	create: function(){
		load("Creating...");
		wsserver = cordova.plugins.wsserver;
		
        wsserver.start(0, {
			'onFailure' :  function(addr, port, reason) {
				stop_load();
				var message = 'Stopped listening on '+addr+':'+port+'. Reason: '+reason;
				element.innerHTML+=`<div class="notification">${message}</div>`;
			},
			'onOpen' : function(conn) {
				stop_load();
				user = conn.uuid;
				var message = 'A user connected from' + conn.remoteAddr;
				element.innerHTML+=`<div class="notification">${message}</div>`;
				
				//new code
				var config = {
					isInitiator: false,
					streams: {
						audio: true,
						video: false
					}
				}

				server.session = new cordova.plugins.phonertc.Session(config);
				
				server.session.on('sendMessage', function (data) { 
					wsserver.send({'uuid':user}, JSON.stringify(data));
				});
				
				server.session.on('answer', function () { 
					alert("other client answered");
				});
				
				server.session.call();
			},
			'onMessage' : function(conn, msg) {
				stop_load();
				element.innerHTML+=`<div class="rep bubble"><i class="material-icons left circle sample">account_circle</i>: ${msg}</div>`;
				server.session.receiveMessage(JSON.parse(msg));
			},
			'onClose' : function(conn, code, reason, wasClean) {
				stop_load();
				var message = 'A user disconnected from ' + conn.remoteAddr;
				element.innerHTML+= `<div class="notification">${message}</div>`;
			}
		}, function onStart(addr, port) {
			
			var ip;
			wsserver.getInterfaces(function(result) {
				stop_load();
				ip = result.wlan0.ipv4Addresses[0];
				var message = 'CHAT ADDRESS '+ip+': '+port;
				element.innerHTML+= `<div class="notification">${message}</div>`;
			});
			
		}, function onDidNotStart(reason) {
			stop_load();
			var message = 'Did not start. Reason: '+reason;
			element.innerHTML+=`<div class="notification">${message}</div>`;
		});
	},
	send: function(){
		var msg = document.getElementById('msg').value;
		document.getElementById('msg').value = "";
		wsserver.send({'uuid':user}, msg);
		element.innerHTML += `<div class='bubble'>${msg}:<i class="material-icons left circle sample">account_circle</i></div>`;
	},
	arback: function(){
		wsserver.stop(function onStop(addr, port) {
			console.log('Stopped listening on %s:%d', addr, port);
		});
		window.location = "index.html";
	},
	call: function(){
		var options = {
			androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
			title: 'Voice call options',
			subtitle: 'Choose wisely, my friend',
			buttonLabels: ['Get My ID', 'Enter other ID'],
			androidEnableCancelButton : true,
			winphoneEnableCancelButton : true,
			addCancelButtonWithLabel: 'Cancel',
			position: [20, 40],
		};
		
		window.plugins.actionsheet.show(options,function(index){
			if(index == 1){
				server.initiator();
			}else{
				server.notinitiator();
			}
		});
	},
	initiator: function(){
		var list = [
		  permissions.RECORD_AUDIO,
		  permissions.MODIFY_AUDIO_SETTINGS
		];
		
		permissions.requestPermissions(list,function(status){
			alert(status.hasPermission);
		},function(){
			alert('cant get permissions');
		});
	}
};

server.init();