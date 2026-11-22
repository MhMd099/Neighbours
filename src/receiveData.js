export async function ladePunktwolke() {
    try {
        const response = await fetch('services/mock.php');

        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/octet-stream')) {
            throw new Error(`Falscher Header erhalten: ${contentType}`);
        }

        const buffer = await response.arrayBuffer();
        const floatArray = new Float32Array(buffer);

       
        console.log(floatArray);

        for (let i = 0; i < floatArray.length; i += 4) {
            const point = i / 4;
            console.log(
                `Punkt ${point} -> ` +
                `X: ${floatArray[i]}, ` +
                `Y: ${floatArray[i + 1]}, ` +
                `Z: ${floatArray[i + 2]}, ` +
                `Sicherheit: ${floatArray[i + 3]}`
            );
        }

    } catch (error) {
        console.error("Fehler beim Laden:", error.message);
    }
}

