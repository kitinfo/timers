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
		header("Content-type: text/calendar");
		?>
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//kitinfo//timers api//EN
CALSCALE:GREGORIAN
<?php
		foreach($retVal["timers"] as $timer){
?>
BEGIN:VEVENT
DTSTART:<?php print($timer["year"].str_pad($timer["month"], 2, "0").str_pad($timer["day"], 2, "0")."T".str_pad($timer["hour"], 2, "0").str_pad($timer["minute"], 2, "0")."00\n"); ?>
UID:<?php print($ICAL_TAG."-".$timer["id"]."\n"); ?>
DTSTAMP:<?php print(date('Ymd\THis\Z')."\n"); ?>
DESCRIPTION:<?php print($timer["event"]."\n"); ?>
END:VEVENT
<?php
		}
?>
END:VCALENDAR
		<?php
	}
	else{
		header("Content-type: application/json");
		print(json_encode($retVal));
	}
?>
