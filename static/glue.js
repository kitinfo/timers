/**
Timers API glue code. Queries the API and creates/runs
the actual timers.
	
	DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
                    Version 2, December 2004 

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net> 

 Everyone is permitted to copy and distribute verbatim or modified 
 copies of this license document, and changing it is allowed as long 
 as the name is changed. 

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 

  0. You just DO WHAT THE FUCK YOU WANT TO.

*/

var timerGlue={
	//Status display update call
	updateStatus:function(text){
		document.getElementById("status-info").innerText=text;
	},
	//Query API, create Timers, run them. Or display an error message.
	init:function(){
		timerGlue.updateStatus("Fetching...");
		ajax.asyncGet("timerapi.php",function(req){		//IF YOU USE ANOTHER API PROVIDER, CHANGE THIS URL
			if(req.status==200){
				try{
					var response=JSON.parse(req.responseText);
				}
				catch(e){
					timerGlue.updateStatus("Failed to parse response");
					return;
				}
				if(!response.timers){
					timerGlue.updateStatus("No timers received.");
					return;
				}
				response.timers.forEach(function(element){
					timers.create(element.id,element.event,new Date(element.year,element.month-1,element.day,element.hour,element.minute,element.second,0),element.message);
				});
				timers.run();
				timerGlue.updateStatus("OK");
			}
			else{
				timerGlue.updateStatus("API error");
			}
		},
		function(e){
			timerGlue.updateStatus("Failed to contact API");
		});
	}
};