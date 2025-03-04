const Tesseract = require('tesseract.js');

async function transcribeImage(imagePath) {
    try {
        // Iniciar el reconocimiento OCR sobre la imagen en español
        const { data: { text } } = await Tesseract.recognize(
            imagePath,   // Ruta de la imagen
            'spa',       // Idioma español
            {
                logger: (m) => console.log(m)  // Opcional: ver el progreso
            }
        );

        console.log('Texto extraído de la imagen:', text);
        return text;  // Devuelve el texto extraído
    } catch (error) {
        console.error('Error al extraer texto de la imagen:', error.message);
        return null;
    }
}

module.exports = transcribeImage;
