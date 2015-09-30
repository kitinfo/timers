<?php
	/*
	TimerAPI PHP backend. Queries the SQLite Database and pushes all
	results via JSON.

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

	//YOUR INSTANCE SETTINGS HERE
	$ICAL_TAG = "my-timers"; //Change this to avoid ICS conflicts between instances
	$db = new PDO("sqlite:/var/www/databases/timers.db3");
	//END OF SETTINGS

	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
	
	$retVal["status"] = "ok";
	
	$STMT=$db->query("SELECT * FROM active WHERE 1");
	if($STMT!==FALSE){
		$retVal["timers"]=$STMT->fetchAll(PDO::FETCH_ASSOC);
		$STMT->closeCursor();
	}
	else{
		$retVal["status"]="Failed to create statement";
	}
	
	header("Access-Control-Allow-Origin: *");
	if(isset($_GET["ics"])){
		#header("Content-type: text/calendar");
		print("BEGIN:VCALENDAR\r\n");
		print("VERSION:2.0\r\n");
		print("PRODID:-//kitinfo//timers api//EN\r\n");
		print("CALSCALE:GREGORIAN\r\n");
		foreach($retVal["timers"] as $timer){
			print("BEGIN:VEVENT\r\n");
			print("DTSTART:".
				$timer["year"].
				str_pad($timer["month"], 2, "0", STR_PAD_LEFT).
				str_pad($timer["day"], 2, "0", STR_PAD_LEFT).
				"T".
				str_pad($timer["hour"], 2, "0", STR_PAD_LEFT).
				str_pad($timer["minute"], 2, "0", STR_PAD_LEFT).
				"00\r\n");
			print("UID:".$ICAL_TAG."-".$timer["id"]."\r\n");
			print("DTSTAMP:".date('Ymd\THis\Z')."\r\n");
			print("DESCRIPTION:".$timer["event"]."\r\n");
			print("END:VEVENT\r\n");
		}
		print("END:VCALENDAR");
	}
	else{
		header("Content-type: application/json");
		print(json_encode($retVal));
	}
?>
