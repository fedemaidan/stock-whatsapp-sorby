const { getByChatgpt35TurboByText } = require("./Base");
const { obtenerTodosLosMateriales } = require('../BDServices/Funciones/FuncionesMaterial');
const {obtenerTodasLasObras } = require('../BDServices/Funciones/FuncionesObra');
const FlowManager = require('../../FlowControl/FlowManager')

const opciones = [
    {
        accion: "Crear Egreso",
        data:
        {
            obra_id: "Id de la obra",
            obra_name: "El nombre de la obra / identificacion hacia donde iran los materiales",
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
    }, 
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
    },
    {
        accion: "Crear Confirmacion",
        data:
        {
            Nro_Pedido: "aqui va el numero de pedido dado por el usuario",
        }
    }
];

// Servicio para analizar la intención del mensaje
const analizarIntencion = async (message, userId) => {
    try
    {
        const materiales = await obtenerTodosLosMateriales();
        const Obras = await obtenerTodasLasObras()
  
        const opcionesTxt = JSON.stringify(opciones);
        prompt = `
Como bot de un sistema de control de stock, quiero identificar la intención del usuario y ejecutar la acción adecuada para gestionar correctamente las operaciones posibles.

Formato de respuesta: Devuelve únicamente un JSON con los datos cargados, sin incluir explicaciones adicionales.

Advertencia: Revisa cuidadosamente el mensaje del usuario y asegúrate de coincidir exactamente con todos los detalles del producto solicitado, como tamaño, color y tipo de material. No elijas productos basándote en coincidencias parciales.

Resumen del contexto: Soy un bot encargado de gestionar el stock de productos y ayudar a los usuarios a encontrar y seleccionar artículos en función de sus descripciones. Si el usuario proporciona características específicas (como "2,5mm", "celeste", "tamaño 3/4"), debo garantizar que la selección sea precisa, por otra parte si el usuario hace dicho de palabras como "Rechazar", "Completar", y la palabra "pedido" se encuentra acompañando a estas palabras esta referido a la opcion "Crear Confirmacion".

El usuario dice: "${message}"

Tienes estas acciones posibles debes analizar la palabra clave del usuario tanto si quiere retirar algo del stock o ingresarlo: ${opcionesTxt}.

Aquí está el stock disponible:
${JSON.stringify(materiales, null, 2)}
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
