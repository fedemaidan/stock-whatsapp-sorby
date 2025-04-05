const { getByChatGpt4o } = require("../Base");
const { obtenerTodasLasObras } = require('../../BDServices/Funciones/FuncionesObra');
const opcion =
{
    accion: "Detectar Obra",
    data:
    {
        obra_name: "nombre de la obra elejida",
        obra_id: "id de la obra elejida"
    }
}
async function DetectarObra(mensajeCliente, opcionesObras ,userId) {

    console.log("ENTRO a detectar obras")
    const Obras = await obtenerTodasLasObras()

    prompt = `
Como bot de un sistema de control de stock, quiero identificar la intención del usuario y ejecutar la acción adecuada para gestionar correctamente la confirmación o cancelación de pedidos.

Formato de respuesta: Devuelve exclusivamente un JSON modificando los datos dependiendo de la interpretación, sin incluir texto adicional.

Resumen del contexto: Soy un bot encargado de gestionar y detectar obras.

--En caso de que el usuario diga un numero, ese numero corresponde no al ID, si no a la posicion de la obra en la lista de "posibles obras disponibles"
El usuario dice: "${mensajeCliente}"

Aqui estan las obras disponibles: (es solo para matchear las obras, no es la lista de la cual se tiene que elejir, esto es solo para corregir cualquier error en la eleccion. [EJ:s0lcito en realidad es la obra Solcito])
${JSON.stringify(Obras, null, 2)}

Posibles obras disponibles que tienen stock y el mensaje que recientemente le envie:
${JSON.stringify(opcionesObras, null, 2)}

Formato de respuesta esperado (EXCLUSIVAMENTE JSON, sin texto adicional):
${JSON.stringify(opcion, null, 2)}
`;

    const response = await getByChatGpt4o(prompt);
    const respuesta = JSON.parse(response);

    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data
    }
    else {
        return respuesta
    }
}
module.exports = DetectarObra;