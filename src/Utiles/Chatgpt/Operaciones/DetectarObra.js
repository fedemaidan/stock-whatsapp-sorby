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
Sos un bot de un sistema de control de stock. Tu tarea es interpretar correctamente la elección del usuario sobre una obra.

Formato de respuesta: EXCLUSIVAMENTE un JSON válido, sin explicaciones ni texto adicional.

Contexto:
- El usuario debe elegir una obra para devolver material.
- Se le mostraron solo algunas obras con stock, en orden.
- Si el usuario responde con un número (ej: "1"), ese número representa la posición en la lista de obras disponibles, NO su ID.

Ejemplo:
Usuario dice: "2"
Lista mostrada: 
1. [id:58, nombre: "Solares"]
2. [id:45, nombre: "Don Alberto"]
3. [id:77, nombre: "FlyDac"]
Respuesta del bot: Se elige la obra en la posición 2 → Don Alberto.

---

El usuario escribió:
"${mensajeCliente}"

Obras disponibles para corregir errores de tipeo o coincidencias aproximadas:
${JSON.stringify(Obras, null, 2)}

Lista de obras elegibles (en este orden, usar índice si el usuario dio un número):
${JSON.stringify(opcionesObras, null, 2)}

Formato de respuesta esperado (solo JSON, sin explicaciones):
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