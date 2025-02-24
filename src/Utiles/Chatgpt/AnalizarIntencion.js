const { getByChatgpt35TurboByText } = require("./Base");
const stock = require("../MaterialsService");
const Obras = require("../ObrasService");
const FlowManager = require('../../FlowControl/FlowManager')

const opciones = [
    {
        accion: "CrearEgreso",
        data:
        {
            obra_id: "Id de la obra",
            obra_name: "El nombre de la obra / identificacion hacia donde iran los materiales",
            items: [{ producto_id: "id del producto al que me estoy refiriendo", producto_name: "nombre del producto al que me estoy refiriendo", cantidad: "Cantidad de este material indicado" },]
        }
    }, 
    {
        accion: "CrearIngreso",
        data:
        {
            obra_id: "Id de la obra",
            obra_name: "El nombre de la obra / identificacion hacia donde iran los materiales",
            items: [{ producto_id: "id del producto al que me estoy refiriendo", producto_name: "nombre del producto al que me estoy refiriendo", cantidad: "Cantidad de este material indicado" },]
        }
    }
];

// Servicio para analizar la intención del mensaje
const analizarIntencion = async (message, userId) => {
    try
    {
        const opcionesTxt = JSON.stringify(opciones);
        prompt = `
Como bot de un sistema de control de stock, quiero identificar la intención del usuario y ejecutar la acción adecuada para gestionar correctamente las operaciones posibles.

Formato de respuesta: Devuelve únicamente un JSON con los datos cargados, sin incluir explicaciones adicionales.

Advertencia: Revisa cuidadosamente el mensaje del usuario y asegúrate de coincidir exactamente con todos los detalles del producto solicitado, como tamaño, color y tipo de material. No elijas productos basándote en coincidencias parciales.

Resumen del contexto: Soy un bot encargado de gestionar el stock de productos y ayudar a los usuarios a encontrar y seleccionar artículos en función de sus descripciones. Si el usuario proporciona características específicas (como "2,5mm", "celeste", "tamaño 3/4"), debo garantizar que la selección sea precisa.

El usuario dice: "${message}"
Tienes estas acciones posibles: ${opcionesTxt}.
Aquí está el stock disponible:
${JSON.stringify(stock, null, 2)}
Aqui estan las obras disponibles:
${JSON.stringify(Obras, null, 2)}
`;
        const response = await getByChatgpt35TurboByText(prompt);
        const respuesta = JSON.parse(response);
        console.log(response)
        if (respuesta.hasOwnProperty('json_data'))
        {
            return respuesta.json_data
        }
        else
        {
            return respuesta
        }
    } catch (error) {
        console.error('Error al analizar la intención:', error.message);
        return 'desconocido'; // Intención predeterminada en caso de error
    }
};

module.exports = { analizarIntencion };
