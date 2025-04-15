const path = require('path');
const fs = require('fs');
const { Pedido } = require('../../../models'); // Asegúrate de importar el modelo correctamente

module.exports = async function enviarPDFWhatsApp(filepath,sock, recipient) {
    try {
        const filePath = filepath;

        if (!fs.existsSync(filePath)) {
            throw new Error('El archivo PDF no existe en la ruta especificada.');
        }

        const pdfBuffer = fs.readFileSync(filePath); // Lee el archivo PDF

        // Enviar el archivo PDF al usuario
        await sock.sendMessage(recipient, {
            document: pdfBuffer,  // El documento que se va a enviar
            mimetype: 'application/pdf',  // Tipo MIME para el archivo PDF
            fileName: path.basename(filePath)  // Nombre del archivo
        });

        console.log(`PDF enviado a ${recipient}`);
    } catch (error) {
        console.error("Error enviando el PDF:", error);
    }
}