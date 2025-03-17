const {getByChatgpt4Vision} = require('../Chatgpt/Base')
const { obtenerTodosLosMateriales } = require('../BDServices/Funciones/FuncionesMaterial');
const { obtenerTodasLasObras } = require('../BDServices/Funciones/FuncionesObra');

async function transcribeImage(imagePath) {
    try {

        const materiales = await obtenerTodosLosMateriales();
        const Obras = await obtenerTodasLasObras()
        prompt = `
Sos un experto transcribiendo imagenes. Ten en cuenta que el usuario tiene la siguiente base de datos:

Devolve solo un json con el texto transcribido.

    {
        accion: "Crear Ingreso",
        data:
        {
            obra_id: "El id de la obra a la que se refiere en caso de no referise a una obra dentro del mensaje pon 0",
            obra_name:"Aqui va la obra a la que iran asignado los materiales en caso de no especificarla en el mensaje solo pon GENERAL",
            nro_compra: "Aqui va el numero del remito o factura en caso de no haber ingresado nada el usuario referiendose a este mismo simplemente poner 00000",
            items:
            [
                {
                    producto_id: "id del producto al que me estoy refiriendo",
                    producto_name: "nombre del producto al que me estoy refiriendo",
                    cantidad: "Cantidad de este material indicado",
                    SKU: "El codigo interno del deposito",
                    zona: "ubicacion, en que zona del deposito se encuentra el material."
                },
            ]
        }
    }

Aquí está el stock disponible:
${JSON.stringify(materiales, null, 2)}
Aqui estan las obras disponibles:
${JSON.stringify(Obras, null, 2)}
`;

        // Consultar a OpenAI
        const response = await getByChatgpt4Vision([imagePath], prompt);

        const respuesta = JSON.parse(response);

        console.log(response)

        if (respuesta.hasOwnProperty('json_data')) {
            return respuesta.json_data
        }
        else {
            return respuesta
        }

    } catch (error)
    {
        console.error('Error analizando la factura en OPEN IA:', error.message);
        return null;
    }
}
module.exports = transcribeImage;
