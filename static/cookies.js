/**
	The awesome	
	CodeBlue pseudo-cross-browser 
	Cookie handling module

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

var cookies={
	setCookie:function(name,value,expiry){
		document.cookie=name+"="+encodeURI(value)+(expiry==undefined?"":"; expires="+expiry.toUTCString());
	},
	getCookie:function(name){
		var cookies=document.cookie.split("; ");
		for(var i=0;i<cookies.length;i++){
			if(cookies[i].indexOf(name+"=")==0){
				return decodeURI(cookies[i].substring(name.length+1));
			}
		}
		return false;
	}
};
