/**
Timers API glue code. Queries the API and creates/runs
the actual timers. Also handles selection and highlighting.
	
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
		document.getElementById("status-info").textContent=text;
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
				
				//create timers from received data
				response.timers.forEach(function(element){
					timers.create(element.id,element.event,new Date(element.year,element.month-1,element.day,element.hour,element.minute,element.second,0),element.message);
				});
				
				//start the countdowns
				timers.run();
				
				//insert click handler for highlighting/selection
				timers.instances.forEach(function(i){
					i.getDomNode().getElementsByClassName("timer")[0].onclick=timerGlue.timerClick;
				});
				
				//apply older selection
				timerGlue.applyGlobalState();
				timerGlue.updateStatus("OK");
			}
			else{
				timerGlue.updateStatus("API error");
			}
		},
		function(e){
			timerGlue.updateStatus("Failed to contact API");
		});
		
		//update "selected only" checkbox
		document.getElementById("selected-only").checked=cookies.getCookie("selectedOnly")=="true"?true:false;
	},
	timerClick:function(event){
		var currentTimer=event.currentTarget.getAttribute("data-id");
		if(!currentTimer){
			return;
		}
		selectedTimers=[];
		
		var selectedJSON=cookies.getCookie("selectedTimers")||"[]";
		if(selectedJSON){
			try{
				selectedTimers=JSON.parse(selectedJSON);
			}
			catch(e){
				//ignore
			}
		}
		
		if(selectedTimers.indexOf(currentTimer)!=-1){
			//deselect
			selectedTimers.splice(selectedTimers.indexOf(currentTimer),1);
		}
		else{
			//select
			selectedTimers.push(currentTimer);
		}
		
		cookies.setCookie("selectedTimers",JSON.stringify(selectedTimers));
		timerGlue.applyGlobalState();
	},
	applyGlobalState:function(){
		var selectionMode=cookies.getCookie("selectedOnly")=="true"?true:false;
		var selectedJSON=cookies.getCookie("selectedTimers")||"[]";
		try{
			var selectedTimers=JSON.parse(selectedJSON);
		}
		catch(e){
			var selectedTimers=[];
		}
		
		if(selectionMode){
			document.getElementById("click-action").textContent="Clicking a timer hides it";
		}
		else{
			document.getElementById("click-action").textContent="Clicking a timer selects it";
		}
		
		//apply styles
		timers.instances.forEach(function(i){
			if(selectionMode){
				if(selectedTimers.indexOf(i.id)==-1){
					i.getDomNode().style.display="none";
				}
				else{
					i.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="";
				}
			}
			else{
				i.getDomNode().style.display="block";
				if(selectedTimers.indexOf(i.id)!=-1){
					i.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="#666";
				}
				else{
					i.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="";
				}
			}
		});
	},
	selectedOnly:function(){
		cookies.setCookie("selectedOnly",document.getElementById("selected-only").checked);
		timerGlue.applyGlobalState();
	}
};
