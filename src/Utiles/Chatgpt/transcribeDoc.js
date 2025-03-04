const path = require('path');
const fs = require('fs');
const pdfPoppler = require('pdf-poppler');

module.exports = async function transcribeDoc(pdfPath) {
    try {
        const outputDir = path.join(__dirname, 'Utiles', 'Chatgpt', 'Operaciones', 'temp');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.join(outputDir, 'pdf_output');

        let options = {
            format: 'jpeg',
            out_dir: outputDir,
            out_prefix: 'pdf_output',
            page: 1
        };

        await pdfPoppler.convert(pdfPath, options);

        console.log(`Imagen generada en: ${outputFilePath}-1.jpg`);
        return `${outputFilePath}-1.jpg`;
    } catch (error) {
        console.error('Error al convertir el PDF:', error);
        return null;
    }
};
