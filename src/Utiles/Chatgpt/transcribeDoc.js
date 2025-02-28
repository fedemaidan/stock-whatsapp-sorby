const fs = require('fs');
const openai = require('../Chatgpt/openai');
const stock = require('../../Utiles/BDServices/MaterialsService');

async function transcribeDoc(filePath) {
    try {
        // Prompts para analizar el cheque
        const prompt = `
            Eres un experto pasando archivos y documentos a texto. Voy a proporcionarte una imagen o documento de un remito ADJUNTA.

            devuelve los datos como texto plano de lo que se encuentra en los archivos.
        `;

        // Consultar a OpenAI
        const response = await getByChatgpt4Vision([filePath], prompt);

        const respuesta = JSON.parse(response);
        console.log('Respuesta de OpenAI:', respuesta);
        if (respuesta.hasOwnProperty('json_data'))
            return { respuesta: respuesta.json_data};
        else
            return { respuesta: respuesta};
    } catch (error) {
        console.error('Error analizando el cheque:', error.message);
        return null;
    }
};
module.exports = transcribeDoc;
