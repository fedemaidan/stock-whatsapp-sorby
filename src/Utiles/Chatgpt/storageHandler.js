const fs = require('fs');
const path = require('path');
const os = require('os');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { admin } = require('./firebaseUtils'); // Configuración de Firebase Admin
const { convertPdfToJpeg } = require('../Chatgpt/convertPdfToJpeg');

// Guardar un archivo en Firebase Storage
async function saveFileToStorage(buffer, fileName, filePath, mimeType) {
    const bucket = admin.storage().bucket();

    try {
        const file = bucket.file(filePath);
        await file.save(buffer, { metadata: { contentType: mimeType } });

        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
        });

        console.log(`Archivo subido: ${signedUrl}`);
        return { success: true, signedUrl };
    } catch (error) {
        console.error('Error al guardar archivo en Firebase:', error.message);
        return { success: false, error: error.message };
    }
}

// Guardar imagen o PDF en Firebase y localmente
async function saveImageToStorage(message, senderPhone) {
    try {
        console.log('Guardando imagen en Firebase y localmente...', message);
        const mimeType = message.message.documentMessage.mimetype;
        const buffer = await downloadMediaMessage(message, 'buffer');
        const date = new Date().toISOString().split('T')[0];
        const randomNumber = Math.floor(Math.random() * 1000000);
        const downloadsDir = path.join(__dirname, '../src/downloads');

        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true });
        }

        if (mimeType === 'application/pdf') {
            // Guardar PDF localmente
            const pdfLocalPath = path.join(downloadsDir, `${randomNumber}.pdf`);
            fs.writeFileSync(pdfLocalPath, buffer);

            // Convertir PDF a imágenes
            const outputDir = path.join(os.tmpdir(), `pdf_images_${randomNumber}`);
            fs.mkdirSync(outputDir, { recursive: true });
            const { outputPrefix, pageCount } = await convertPdfToJpeg(pdfLocalPath, outputDir);

            if (pageCount === 0) {
                console.error('No se generaron imágenes del PDF.');
                return null;
            }

            // Subir la primera imagen generada
            const firstPagePath = `${outputPrefix}-1.jpeg`;
            const imageBuffer = fs.readFileSync(firstPagePath);

            // Guardar imagen localmente
            const localImagePath = path.join(downloadsDir, `${randomNumber}.jpeg`);
            fs.writeFileSync(localImagePath, imageBuffer);

            const filePath = `StockRemito/${senderPhone}/${date}/${randomNumber}.jpeg`;
            const storageResult = await saveFileToStorage(imageBuffer, `${randomNumber}.jpeg`, filePath, 'image/jpeg');

            return storageResult.success ? { signedUrl: storageResult.signedUrl, localPath: localImagePath } : null;
        } else {
            // Guardar imagen localmente
            const localImagePath = path.join(downloadsDir, `${randomNumber}.jpeg`);
            fs.writeFileSync(localImagePath, buffer);

            // Guardar imagen en Firebase
            const filePath = `StockRemito/${senderPhone}/${date}/${randomNumber}.jpeg`;
            const storageResult = await saveFileToStorage(buffer, `${randomNumber}.jpeg`, filePath, 'image/jpeg');

            return storageResult.success ? { signedUrl: storageResult.signedUrl, localPath: localImagePath } : null;
        }
    } catch (error) {
        console.error('Error descargando/guardando archivo:', error.message);
        return null;
    }
}

module.exports = { saveImageToStorage };
