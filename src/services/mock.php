<?php
// 1. Binär-Header setzen (Teilt dem Browser mit: "Hier kommen rohe Bytes")
header('Content-Type: application/octet-stream');

// 2. Test-Punktwolke definieren (4 Punkte mit je X, Y, Z, Sicherheit)
$werte = [
    0.0,  0.0, 0.0, 1.0,  // Punkt 0
    1.0,  5.0, 0.0, 1.0,  // Punkt 1 (Y = 5.0)
    0.0, 10.0, 0.0, 1.0,  // Punkt 2 (Y = 10.0)
    0.0,  0.0, 1.0, 1.0,  // Punkt 3
];

// 3. Y und Z auf dem Server tauschen
// Hinweis: Bei normalen PHP-Arrays beginnt der Index bei 0 ($i = 0)
$anzahlWerte = count($werte);
for ($i = 0; $i < $anzahlWerte; $i += 4) {
    $yIndex = $i + 1;
    $zIndex = $i + 2;

    $temp = $werte[$yIndex];
    $werte[$yIndex] = $werte[$zIndex];
    $werte[$zIndex] = $temp;
}

// 4. Als 32-Bit-Float-Stream packen und direkt ausgeben
echo pack('g*', ...$werte);