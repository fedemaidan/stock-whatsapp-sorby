const { getByChatGpt4o } = require("../Base");
const FlowManager = require('../../../../src/FlowControl/FlowManager')

const ChatModificarConfirmacion = async (message, userId) => {
    console.log("🔵 [ChatModificarConfirmacion]: ", message);
    console.log("🔵 [FlowData]: ", FlowManager.userFlows[userId]?.flowData);
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;
    const itemsOriginales = pedidoAntiguo.movimientos;

    const prompt2 = `
    Como bot de gestión de pedidos de retiro de materiales, debo actualizar el pedido según los cambios solicitados por el usuario, sin sobreescribir completamente el pedido anterior. Para ello, debo interpretar la solicitud y aplicar una de las siguientes acciones:

Aprobados: Todo lo que no fue rechazado debe ser aprobado. Es decir, si tengo X de un producto, y el cliente dice que falta Y del mismo producto. Tengo aprobado X-Y

Rechazados: Si una parte del pedido no puede ser aprobada, la cantidad rechazada debe reflejarse en la lista de productos rechazados.

Modificar cantidad: Si el usuario pide cambiar la cantidad de un producto, actualizar la cantidad a la solicitada.

Estructura esperada del JSON de respuesta:

"aprobados" debe contener solo las cantidades aprobadas del pedido.
"rechazados" debe contener las cantidades no aprobadas.
Las suma de la cantidad del aprobados y rechazados deben ser igual a la de items_originales
\`\`\`
{
  "items_originales": ${JSON.stringify(itemsOriginales, null, 2)},
  "aprobados": [
    {
      "producto_name": "nombre del producto",
      "cantidad": "cantidad del producto",
      "obra_origen": "obra que sedio los productos",
      "obra_destino": "obra a la que se destinaron (puede estar vacio)"
    }
  ],
  "rechazados": [
    {
      "producto_name": "nombre del producto",
      "cantidad": "cantidad del producto",
      "obra_origen": "obra que sedio los productos",
      "obra_destino": "obra a la que se destinaron (puede estar vacio)"
    }
  ]
}
\`\`\`
Mensaje del cliente: "${message}"`


    const prompt = `
Como bot de gestión de pedidos de retiro de materiales, debo actualizar el pedido según los cambios solicitados por el usuario, sin sobreescribir completamente el pedido anterior. Para ello, debo interpretar la solicitud y aplicar una de las siguientes acciones:

3. **Quitar o eliminar:** Si el usuario indica "quitar" o "eliminar" un producto, reducir la cantidad o eliminarlo completamente si la cantidad a quitar es igual o mayor a la existente. Los productos eliminados o reducidos se deben almacenar en un campo separado llamado "eliminados".
4. **Modificar cantidad:** Si el usuario pide cambiar la cantidad de un producto, actualizar la cantidad a la solicitada.

**Estructura esperada del JSON de respuesta:**  NO ADHIERAS EL PEDIDO VIEJO AL NUEVO JSON
SOLO DEVUELVE EL JSON MODIFICADO anexado abajo SEGUN LA INTERPRETACION NADA MAS
json (solo esto tiene que salir en este formato, de esta manera con los datos que corresponda cambiar nada mas.)
\`\`\`
{
  "items_originales": ${JSON.stringify(itemsOriginales, null, 2)},
  "aprobados": [
    {
      "producto_name": "nombre del producto",
      "cantidad": "cantidad del producto",
      "obra_origen": "obra que sedio los productos",
      "obra_destino": "obra a la que se destinaron (puede estar vacio)"
    }
  ],
  "rechazados": [
    {
      "producto_name": "nombre del producto",
      "cantidad": "cantidad del producto",
      "obra_origen": "obra que sedio los productos",
      "obra_destino": "obra a la que se destinaron (puede estar vacio)"
    }
  ]
}
\`\`\`
Mensaje del cliente: "${message}"

`;

console.log(prompt)

    const response = await getByChatGpt4o(prompt);
    let respuesta = JSON.parse(response);
    respuesta.accion = "Modificar Confirmacion";
    respuesta.nro_pedido = pedidoAntiguo.Nro_Pedido;
    respuesta.fecha = pedidoAntiguo.Fecha;
    respuesta.estado = "Rechazado";
    respuesta.aclaracion = message;
    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data;
    } else {
        return respuesta;
    }
};

module.exports = ChatModificarConfirmacion;
