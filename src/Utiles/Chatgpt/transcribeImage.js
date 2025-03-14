const getByChatgpt4Vision = require('../Chatgpt/Base')
const { obtenerTodosLosMateriales } = require('../BDServices/Funciones/FuncionesMaterial');

async function transcribeImage(imagePath) {
    try {
        // Prompts para analizar el cheque
        const prompt = "Sos un experto transcribiendo imagenes. Ten en cuenta que el usuario tiene la siguiente base de datos: " + db_json;
        // Consultar a OpenAI
        const response = await getByChatgpt4Vision([filePath], prompt);

        const respuesta = JSON.parse(response);
        console.log('Respuesta de OpenAI:', respuesta);
        if (respuesta.hasOwnProperty('json_data'))
            return { respuesta: respuesta.json_data, prompt: prompt };
        else
            return { respuesta: respuesta, prompt: prompt };

    } catch (error)
    {
        console.error('Error analizando el cheque:', error.message);
        return null;
    }
}
module.exports = transcribeImage;
