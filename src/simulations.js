export async function ladePunktwolke(dateiPfad) {
    const antwort = await fetch(dateiPfad);
    const csvText = await antwort.text();
    console.log(csvText);
    const zeilen = csvText.trim().split(/\r?\n/);

    const punkte = [];

    // Erste Zeile überspringen (Spaltenüberschriften).
    for (let i = 1; i < zeilen.length; i++) {
        const werte = zeilen[i].split(";");

        const x = Number(werte[0]);
        const y = Number(werte[2]);
        const z = Number(werte[1]);

        if (
            Number.isFinite(x) &&
            Number.isFinite(y) &&
            Number.isFinite(z)
        ) {
            punkte.push([x, y, z]);
        }
    }

    return punkte;
}
