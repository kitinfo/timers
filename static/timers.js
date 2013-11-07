/*
Timer code v1 originally written as distraction from learning, really ugly
Timer code v2 written 02102012 2044 out of embarassment, much cleaner code
Timer code v3 written 04102012 1337 to neaten up the render code
Timer code v4 modified to accomodate JSON API. SQL-Wrestling done by null_ptr :)
Timer code v4.1 updated to accomodate selection & filtering

Code's commented should be pretty easy to understand.
It's JS, how hard can it be ;P


USAGE
-----
If your document does not have a single DOM node reserved for displaying
the timers, you need to modify timers.create to reflect your mode of operation
(eg, adding a parameter indicating the node to insert the timer into).

Other than that, calling timers.create will do all the creation work for you,
after which you only need to call timers.run once to start the update thread.

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


var timers={
	instances:[],

	//Pad a string with another string - weird that JS doesn't have this natively
	pad:function(str,padString,length){
		str=''+str; //lol bugfix (casting input to string, else integer inputs would fail)
		while(str.length<length){
			str=padString+str;
		}
		return str;
	},
	
	//Create timer object
	Timer:function(id, cause, end, message){
		//store data
		this.id=id;
		this.cause=cause;
		this.end=end;
		this.message=message;
		this.domNode=timers.createTimerDomNode(cause, end);
		this.domNode.getElementsByClassName("timer")[0].setAttribute("data-id",id);
		this.getUpdateNode=function(){return this.domNode.getElementsByClassName("timer-left")[0];};
		this.getDomNode=function(){return this.domNode;};
		this.updateTimer=timers.updateTimerInstance;
	},
	
	//Create a single timer's DOM Node
	createTimerDomNode:function(title, end){
		//create the wrapper element to center the timer
		var timerRoot=document.createElement('div');
		timerRoot.setAttribute('class', 'timer-wrap');
		
		//create the actual timer frame
		timerRoot.appendChild(document.createElement('div'));
		timerRoot.childNodes[0].setAttribute('class','timer');
		
		//create title element
		var timerTitle=document.createElement('h2');
		timerTitle.textContent=title;
		
		//countdown display element
		var timerDisplay=document.createElement('div');
		timerDisplay.setAttribute('class','timer-left');
		
		//timer end info
		var timerInfo=document.createElement('span');
		timerInfo.setAttribute('class','timer-info');
		timerInfo.textContent='left until';
		timerInfo.appendChild(document.createElement('span'));
		timerInfo.childNodes[1].setAttribute('style','float:right;');
		timerInfo.childNodes[1].textContent=timers.pad(end.getDate(),'0',2)+'.'+timers.pad((end.getMonth()+1),'0',2)+'.'+end.getFullYear()+' '+timers.pad(end.getHours(),'0',2)+':'+timers.pad(end.getMinutes(),'0',2);
		
		//cram it all together
		timerRoot.childNodes[0].appendChild(timerTitle);
		timerRoot.childNodes[0].appendChild(timerDisplay);
		timerRoot.childNodes[0].appendChild(timerInfo);
		
		return timerRoot;
	},
	
	//Timer instance update call implementation
	updateTimerInstance:function(){
		//calculate remaining time (milliseconds)
		var timeLeft=this.end.getTime()-(new Date()).getTime();
		var updateTarget=this.getUpdateNode();
		
		//display end message if needed
		if(timeLeft<0){
			updateTarget.textContent=this.message;
		}
		else{
			//get unit mode
			var unitDrop=document.getElementById('maxunit');
			var maxUnit=unitDrop.options[unitDrop.selectedIndex].value;
			var timeString='';
			
			//convert remaining time to seconds
			timeLeft=Math.floor(timeLeft/1000);
		
			switch(maxUnit){
				case "days":
					//get remaining days
					timeString+=timers.pad(Math.floor(timeLeft/(24*60*60)),'0',2)+":";
					timeLeft=timeLeft%(24*60*60);
				case "hours":
					//get remaining hours
					timeString+=timers.pad(Math.floor(timeLeft/(60*60)),'0',2)+":";
					timeLeft=timeLeft%(60*60);
				case "minutes":
					//get remaining minutes
					timeString+=timers.pad(Math.floor(timeLeft/60),'0',2)+":";
					timeLeft=timeLeft%60;
				case "seconds":
					//just use whats left
					timeString+=timers.pad(timeLeft,'0',2);
					updateTarget.textContent=timeString;
					break;
				default:
					//yay you edited the dropdown. pretty cool guy.
					updateTarget.textContent="You broke it.";
			}
		}
	},
	
	//Create a single timer instance and render it to the DOM
	create:function(id, cause, end, message){
		var instance=new timers.Timer(id,cause,end,message);
		//FIXME this should probably test whether the id already exists. not needed as of yet.
		timers.instances.push(instance);
		document.getElementById("timer-main").appendChild(instance.getDomNode());
	},
	
	//Start the update thread for all instances
	run:function(){
		timers.updateAll();
		setInterval(timers.updateAll,1000);
	},
	
	//Update all active instances
	updateAll:function(){
		timers.instances.forEach(function(i){i.updateTimer();});
	}
};