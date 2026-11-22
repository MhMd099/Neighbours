<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);
    exit("nur POST-Anfragen sind erlaubt");
}


$rohdaten = file_get_contents('php://input');

if ($rohdaten === '' || strlen($rohdaten) % 4 !== 0) {
    http_response_code(400);
    exit('Der POST-Body muss mindestens einen Float32-Wert enthalten.');
}

file_put_contents('punktwolke.bin', $rohdaten);

$werte = unpack('g*', $rohdaten);
$anzahlWerte = count($werte);

for ($i = 1; $i <= $anzahlWerte; $i += 4) {
    $yIndex = $i + 1;
    $zIndex = $i + 2;



    $temp = $werte[$yIndex];

    $werte[$yIndex] = $werte[$zIndex];
    $werte[$zIndex] = $temp;
}

header('Content-Type: application/octet-stream');
echo pack('g*', ...$werte);