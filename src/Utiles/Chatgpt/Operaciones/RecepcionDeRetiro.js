const { getByChatgpt35TurboByText } = require("../Base");

const opcion =
{
    accion: "Crear Confirmacion",
    data:
    {
        Eleccion: "El interpreta como 1 para Si, continuar, acepto, (Emoji manito arriba) etc Y 2 para no, detener, para, No (emoji manito abajo) etc"
    }
}
async function RecepcionDeRetiro(mensajeCliente) {
    console.log("ENTRO A RecepcionDeRetiro-*-*-*-*-*-*-*-*-*--*-*-*-*-*")

    prompt = `
Como bot de un sistema de control de stock, quiero identificar la intención del usuario y ejecutar la acción adecuada para gestionar correctamente la confirmación o cancelación de pedidos.

Formato de respuesta: Devuelve exclusivamente un JSON modificando los datos dependiendo de la interpretación, sin incluir texto adicional.

Advertencia:
- Si el usuario responde con "1", "Recibí OK", "Confirmar", "Aceptar", "👍", "✅", "✔️" o números con emojis (ej. "1️⃣"), se interpretará como una confirmación total del pedido y se debe asignar el valor numérico 1 en el campo "Eleccion".
- Si el usuario responde con "2", "Recibí parcialmente OK", "Parcial", "Acepto parcial", "🟡", "⚠️" o números con emojis (ej. "2️⃣"), se interpretará como una confirmación parcial del pedido y se debe asignar el valor numérico 2 en el campo "Eleccion".
- Si el usuario responde con "3", "Rechazo", "No", "Rechazar", "👎", "❌", "✖️" o números con emojis (ej. "3️⃣"), se interpretará como un rechazo total del pedido y se debe asignar el valor numérico 3 en el campo "Eleccion".
- Si el usuario responde con "4", "Cancelar", "cancelar operacion", "Cancelar", "volver atras", o números con emojis (ej. "4️⃣"), se interpretará como la cancelacion de la operacion y se debe asignar el valor numérico 4 en el campo "Eleccion".
Resumen del contexto: Soy un bot encargado de gestionar el stock de productos y validar la intención del usuario con respecto a la confirmación o cancelación de pedidos.

El usuario dice: "${mensajeCliente}"

Formato de respuesta esperado (EXCLUSIVAMENTE JSON, sin texto adicional):
${JSON.stringify(opcion, null, 2)}
`;

    const response = await getByChatgpt35TurboByText(prompt);
    const respuesta = JSON.parse(response);

    console.log(response)
    console.log(respuesta)
    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data
    }
    else {
        return respuesta
    }
}
module.exports = RecepcionDeRetiro;