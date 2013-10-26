/**
	Google +1 Privacy Quickfix.

	Loads the +1-APIs when calling enablePlusOne (by inserting
	a new script tag)
*/
function enablePlusOne(){
	var scriptTag=document.createElement("script");
	scriptTag.src="https://apis.google.com/js/plusone.js";
	document.getElementsByTagName("body")[0].appendChild(scriptTag);
}