const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const fs = require("fs");
const path = require("path");

module.exports = async function transcribeDoc(message) {
    try {
        console.log('Guardando imagen en Firebase...', message);
        const mimeType = message.message.documentMessage.mimetype;
        const buffer = await downloadMediaMessage(message, 'buffer');
        const date = new Date().toISOString().split('T')[0];
        const randomNumber = Math.floor(Math.random() * 1000000);

        if (mimeType === 'application/pdf') {
            // Guardar PDF temporalmente
            const tempDir = os.tmpdir();
            const pdfPath = path.join(tempDir, `${randomNumber}.pdf`);
            fs.writeFileSync(pdfPath, buffer);

            // Convertir PDF a imágenes
            const outputDir = path.join(tempDir, `pdf_images_${randomNumber}`);
            fs.mkdirSync(outputDir, { recursive: true });

            const { outputPrefix, pageCount } = await convertPdfToJpeg(pdfPath, outputDir);

            if (pageCount === 0)
            {
                console.error('No se generaron imágenes del PDF.');
                return null;
            }

            // Subir la primera imagen generada
            const firstPagePath = `${outputPrefix}-1.jpeg`;
            const imageBuffer = fs.readFileSync(firstPagePath);

            const filePath = `StockRemito/${senderPhone}/${date}/${randomNumber}.jpeg`;
            const storageResult = await saveFileToStorage(imageBuffer, `${randomNumber}.jpeg`, filePath, 'image/jpeg');

            return storageResult.success ? storageResult.signedUrl : null;
        } else {
            // Guardar imagen normal
            const filePath = `StockRemito/${senderPhone}/${date}/${randomNumber}.jpeg`;
            return await saveFileToStorage(buffer, `${randomNumber}.jpeg`, filePath, 'image/jpeg');
        }
    } catch (error) {
        console.error('Error descargando/guardando archivo:', error.message);
        return null;
    }
};
