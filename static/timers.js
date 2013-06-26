/*
Timer code v1 originally written as distraction from learning, really ugly
Timer code v2 written 02102012 2044 out of embarassment, much cleaner code
Timer code v3 written 04102012 1337 to neaten up the render code

Code's commented to the max, so it should be pretty easy to understand.
Additionally, it's JS, how hard can it be ;P

You're welcome to copy this anywhere you like, make changes to it, make it do stupid stuff,
just, whatever. See attached license.	--cbdev 2012

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


var uniqueID=0;
var timers=new Array();

//Pad a string with another string - weird that JS doesn't have this natively
function pad(str,padString,length){
	str=''+str; //lol bugfix (casting input to string, else integer inputs would fail)
	while(str.length<length){
		str=padString+str;
	}
	return str;
}


//Create a Timer object to be stored
function Timer(cause, end, message){
	//generate unique id
	this.id=uniqueID++;
	
	//save data
	this.cause=cause;
	this.end=end;
	this.message=message;

	//render the html to display the timer
	function renderTimer(){
		//create the wrapper element to center the timer
		var timerRoot=document.createElement('div');
		timerRoot.setAttribute('class', 'timer-wrap');
		
		//create the actual timer frame
		timerRoot.appendChild(document.createElement('div'));
		timerRoot.childNodes[0].setAttribute('class','timer');
		
		//create title element
		var timerTitle=document.createElement('h2');
		timerTitle.innerHTML=this.cause;
		
		//countdown display element
		var timerDisplay=document.createElement('div');
		timerDisplay.setAttribute('id','timer-'+this.id);
		timerDisplay.setAttribute('class','timer-left');
		
		//store for update calls
		this.updateTarget=timerDisplay;
		
		//timer end info
		var timerInfo=document.createElement('span');
		timerInfo.setAttribute('class','timer-info');
		timerInfo.innerHTML='left until';
		timerInfo.appendChild(document.createElement('span'));
		timerInfo.childNodes[1].setAttribute('style','float:right;');
		timerInfo.childNodes[1].innerHTML=pad(this.end.getDate(),'0',2)+'.'+pad((this.end.getMonth()+1),'0',2)+'.'+this.end.getFullYear()+' '+pad(this.end.getHours(),'0',2)+':'+pad(this.end.getMinutes(),'0',2);
		
		//cream it all together
		timerRoot.childNodes[0].appendChild(timerTitle);
		timerRoot.childNodes[0].appendChild(timerDisplay);
		timerRoot.childNodes[0].appendChild(timerInfo);
		
		//render to document
		document.getElementById('main').appendChild(timerRoot);
	}
	
	//update the timer
	function updateTimer(){
		//calculate remaining time (milliseconds)
		var timeLeft=this.end.getTime()-(new Date()).getTime();
		
		//display end message if needed
		if(timeLeft<0){
			this.updateTarget.innerHTML=this.message;
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
					timeString+=pad(Math.floor(timeLeft/(24*60*60)),'0',2)+":";
					timeLeft=timeLeft%(24*60*60);
				case "hours":
					//get remaining hours
					timeString+=pad(Math.floor(timeLeft/(60*60)),'0',2)+":";
					timeLeft=timeLeft%(60*60);
				case "minutes":
					//get remaining minutes
					timeString+=pad(Math.floor(timeLeft/60),'0',2)+":";
					timeLeft=timeLeft%60;
				case "seconds":
					//just use whats left
					timeString+=pad(timeLeft,'0',2);
					this.updateTarget.innerHTML=timeString;
					break;
				default:
					//yay you edited the dropdown. pretty cool guy.
					this.updateTarget.innerHTML="You broke it.";
			}
		}
	}
	
	this.render=renderTimer;
	this.update=updateTimer;
}

//Create a new timer
function timerCreate(cause,end,message){
	//create new timer
	var timer=new Timer(cause, end, message);
	timers[timer.id]=timer;
	
	//call print
	timer.render();
	
	//call update
	timer.update();
}

//Continuous update function
function runTimers(){
	setInterval(function(){
		//iterate over timers
		for(var i=0;i<timers.length;i++){
			//call update
			timers[i].update();
		}
	},1000);
}
