/*
API glue code
	Queries the API
	Creates timer instances & runs them
	Manages hiding/showing and hashbang URLs
   
This program is free software. It comes without any warranty, to
the extent permitted by applicable law. You can redistribute it
and/or modify it under the terms of the Do What The Fuck You Want
To Public License, Version 2, as published by Sam Hocevar and 
reproduced below.

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
	apiUrl:"timerapi.php",
	selectedTimers:[],
	persist:true,
	showMode:"all", /*positive, negative*/

	statusDisplay:function(text){
		document.getElementById("status-info").textContent=text;
	},

	loadPersistentData:function(){
		//get selected timers from cookie
		var storedJSON=cookies.getCookie("selection")||"[]";
		var storedMode=cookies.getCookie("currentMode")||"\"all\"";
		try{
			var stored=JSON.parse(storedJSON);
			var mode=JSON.parse(storedMode);
		}
		catch(e){
			timerGlue.statusDisplay("Invalid data in cookie, clearing");
			cookies.setCookie("selection", "[]");
			cookies.setCookie("currentMode", "\"all\"");
			var stored=[];
			var mode="all";
		}

		//remove expired timers from selections
		var activeTimers=[];
		timers.instances.forEach(function(t){
			activeTimers.push(parseInt(t.id));
		});

		//TODO test this
		for(var i=stored.length;i>=0;i--){
			if(activeTimers.indexOf(stored[i])<0){
				stored.splice(i,1);
			}
		}

		//get stuff from url
		if(location.hash&&location.hash.indexOf("!")!=-1){
			var urlMode=location.hash.substring(1,location.hash.indexOf("!"));
			var urlSelection=decodeURI(location.hash.substring(location.hash.indexOf("!")+1));
			try{
				var urlTimers=JSON.parse(urlSelection);
			}
			catch(e){
				var urlTimers=[];
			}


			//compare to persistent
			if(urlMode!=mode||!urlTimers.contentEquals(stored)){
				timerGlue.persist=false;
				stored=urlTimers;
				mode=urlMode;
			}
		}
		
		//persist & update hashbang
		timerGlue.selectedTimers=stored;
		timerGlue.showMode=mode;

		var modeSelector=document.getElementById("displaymode");

		for(var i=0;i<modeSelector.options.length;i++){
			if(timerGlue.showMode==modeSelector.options[i].value){
				modeSelector.selectedIndex=i;
			}
		}

		location.hash=timerGlue.showMode+"!"+encodeURI(JSON.stringify(timerGlue.selectedTimers));

	},

	hookPrototypes:function(){
		Array.prototype.contentEquals=function(other){
			if(!other){
				return false;
			}

			if(this.length!=other.length){
				return false;
			}

			for(var i=0;i<this.length;i++){
				if(this[i] instanceof Array && other[i] instanceof Array){
					if(!this[i].contentEquals(other[i])){
						return false;
					}
				}
				else if(this[i]!=other[i]){
					return false;
				}
			}
			return true;
		}
	},

	init:function(){
		//install needed prototypes
		timerGlue.hookPrototypes();

		timerGlue.statusDisplay("Accessing API...");
		//get timers from api
		ajax.asyncGet(timerGlue.apiUrl, function(req){
			//XHR completion function
			if(req.status==200){
				//parse API response
				try{
					var response=JSON.parse(req.responseText);
					if(!response.timers){
						throw "No timers received";
					}
				}
				catch(e){
					timerGlue.statusDisplay("Failed: "+e.message);
					return;
				}
				
				//create all timers
				response.timers.forEach(function(t){
					timers.create(t.id, t.event, new Date(t.year, t.month-1, t.day, t.hour, t.minute, t.second, 0), t.message);
				});

				//start all timers
				timers.run();

				//hook timer clicks
				timers.instances.forEach(function(t){
					t.getDomNode().getElementsByClassName("timer")[0].onclick=timerGlue.timerClick;
				});

				//load selection & settings
				timerGlue.loadPersistentData();

				//apply selections
				timerGlue.relayoutTimers();

				timerGlue.statusDisplay("OK");
			}
			else{
				//http response != 200
				timerGlue.statusDisplay("HTTP "+req.status);
			}
		}, function(e){
			//XHR error function
			timerGlue.statusDisplay("Failed to query API");
		});
	},

	timerClick:function(event){
		//get timer id
		var timerID=event.currentTarget.getAttribute("data-id");
		if(!timerID){
			return;
		}

		timerID=parseInt(timerID);

		//toggle view status
		timerGlue.toggleTimer(timerID);
		
		//relayout
		timerGlue.relayoutTimers();
	},

	toggleTimer:function(t){
		if(timerGlue.selectedTimers.indexOf(t)>=0){
			//remove timer
			timerGlue.selectedTimers.splice(timerGlue.selectedTimers.indexOf(t),1);
		}
		else{
			timerGlue.selectedTimers.push(t);
		}

		//update hashbang url
		location.hash=timerGlue.showMode+"!"+encodeURI(JSON.stringify(timerGlue.selectedTimers));

		//if persist, write cookie
		if(timerGlue.persist){
			cookies.setCookie("selection", JSON.stringify(timerGlue.selectedTimers));
		}
		else{
			//else display message
			timerGlue.statusDisplay("WARNING: changes not saved");
		}
	},


	modeSelectorChange:function(){
		var modeSelector=document.getElementById("displaymode");
		var mode=modeSelector.options[modeSelector.selectedIndex].value;
		
		timerGlue.showMode=mode;

		//update hashbang url
		location.hash=timerGlue.showMode+"!"+encodeURI(JSON.stringify(timerGlue.selectedTimers));

		//if persist, write cookie
		if(timerGlue.persist){
			cookies.setCookie("currentMode", JSON.stringify(timerGlue.showMode));
		}
		else{
			//else display message
			timerGlue.statusDisplay("WARNING: changes not saved");
		}

		timerGlue.relayoutTimers();
	},

	relayoutTimers:function(){
		timers.instances.forEach(function(t){
			var selected=(timerGlue.selectedTimers.indexOf(parseInt(t.id))>=0);
			switch(timerGlue.showMode){
				case "positive":
					//show selected only
					if(selected){
						t.getDomNode().style.display="block";
						t.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="";
					}
					else{
						t.getDomNode().style.display="none";
					}
					break;
				case "negative":
					//hide selected
					if(selected){
						t.getDomNode().style.display="none";
					}
					else{
						t.getDomNode().style.display="block";
						t.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="";
					}
					break;
				default:
					//show all, select marks
					t.getDomNode().style.display="block";
					if(selected){
						t.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="#666";
					}
					else{
						t.getDomNode().getElementsByClassName("timer")[0].style.backgroundColor="";
					}
					break;
			}
		});
	}
};
