<?php
    $particularCase = array(
		'35.00',
		'20.00',
		'20.00',
		'5.000',
		'15.00',
		'1.250',
		'1.250',
		'1.250',
		'1.250'
	);
	$number = $_GET['number'];
	$add = 0;
	foreach($particularCase as $percent){
	    $add += round($number * $percent / 100);
	}
	echo "Number: " . $number . "<br />addResult: " . $add;
	