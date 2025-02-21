const { getByChatgpt35TurboByText } = require("./base");

const opciones = [
    {
        name: "",
        accion: "",
        json_data: {
            "accion": "EGRESO_MATERIALES",
        }
    },
    {
        name: "",
        accion: "",
        json_data: {
            "accion": "CONFIRMAR_PAGO",
        }
    }
];


// Servicio para analizar la intenci�n del mensaje
const analizarIntencion = async (message) => {

    const opcionesTxt = JSON.stringify(opciones);
    try {
        const prompt = `
        Soy un bot de un sistema de control de stock necesito que ayuda a gestionar operaciones posibles. Mi trabajo es identificar la intenci�n del usuario y ejecutar la acci�n adecuada.         
        El usuario dice: "${message}"
        Tienes estas acciones posibles: " + ${opcionesTxt} + ".
        Responde la acci�n que quieres ejecutar y completa los datos correspondientes del JSON.
        Solo pueder retornar las acciones que yo env�o. 
        RESPONDE SOLO CON EL JSON CON LOS DATOS CARGADOS. SOLO USAR ACCIONES LISTADAS. ";
        `;
        const response = await getByChatgpt35TurboByText(prompt);
        const respuesta = JSON.parse(response);
        if (respuesta.hasOwnProperty('json_data'))
            return { respuesta: respuesta.json_data, prompt: prompt };
        else
            return { respuesta: respuesta, prompt: prompt };
    } catch (error) {
        console.error('Error al analizar la intenci�n:', error.message);
        return 'desconocido'; // Intenci�n predeterminada en caso de error
    }
};

module.exports = { analizarIntencion };
