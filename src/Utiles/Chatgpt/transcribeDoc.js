const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const fs = require("fs");
const path = require("path");

module.exports = async function transcribeDoc(pdfPath) {
    try {
        const outputDir = path.join(__dirname, 'Utiles', 'Chatgpt', 'Operaciones', 'temp');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.join(outputDir, 'pdf_output');
        const command = `pdftoppm -jpeg ${pdfPath} ${outputFilePath}`;

        console.log("Iniciando conversión de PDF a imagen...");

        // Ejecuta el comando y espera a que termine
        const { stderr } = await execPromise(command);
        if (stderr) {
            console.error("Error durante la conversión:", stderr);
        }

        const files = fs.readdirSync(outputDir);
        let convertedFile = null;

        for (const file of files) {
            if (file.startsWith("pdf_output") && file.endsWith(".jpg")) {
                const oldPath = path.join(outputDir, file);
                const newPath = oldPath.replace(".jpg", ".jpeg");
                fs.renameSync(oldPath, newPath);
                convertedFile = newPath;
                break; // Solo retorna la primera página
            }
        }

        if (!convertedFile) {
            console.error("No se generó ninguna imagen.");
            return null;
        }

        console.log(`Imagen generada en: ${convertedFile}`);
        return convertedFile;
    } catch (error) {
        console.error('Error al convertir el PDF:', error);
        return null;
    }
};
