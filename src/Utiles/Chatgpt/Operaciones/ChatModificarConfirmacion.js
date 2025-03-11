const { getByChatgpt35TurboByText } = require("../Base");
const FlowManager = require('../../../../src/FlowControl/FlowManager')

const ChatModificarConfirmacion = async (message, userId) => {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    prompt = `
Como bot de gestión de pedidos de retiro de materiales, debo actualizar el pedido según los cambios solicitados por el usuario, sin sobreescribir completamente el pedido anterior. Para ello, debo interpretar la solicitud y aplicar una de las siguientes acciones:

3. **Quitar o eliminar:** Si el usuario indica "quitar" o "eliminar" un producto, reducir la cantidad o eliminarlo completamente si la cantidad a quitar es igual o mayor a la existente. Los productos eliminados o reducidos se deben almacenar en un campo separado llamado "eliminados".
4. **Modificar cantidad:** Si el usuario pide cambiar la cantidad de un producto, actualizar la cantidad a la solicitada.

**Estructura esperada del JSON de respuesta:**  NO ADHIERAS EL PEDIDO VIEJO AL NUEVO JSON
json (solo esto tiene que salir en este formato, de esta manera con los datos que corresponda cambiar nada mas.)
\`\`\`

{
  accion: "Modificar Confirmacion",
  nro_pedido: numero del pedido,
  fecha: fecha del pedido,
  estado: 'Rechazado',
  aclaracion: "Mensaje original del usuario que motivó los cambios",
  aprobados: [
    {
      // Datos del pedido actualizado y como quedo luego de la modificacion
      producto_name: nombre del producto,
      cantidad: cantidad del producto,
      obra_origen: obra que sedio los productos,
      obra_destino: obra a la que se destinaron (puede estar vacio)
    }
  ]
  rechazados: [
    {
      // Aquí van los productos eliminados o reducidos
      producto_name: nombre del producto,
      cantidad: cantidad del producto,
      obra_origen: obra que sedio los productos,
      obra_destino: obra a la que se destinaron (puede estar vacio)
    }
  ]
}
\`\`\`
Mensaje del cliente: "${message}"

Pedido antiguo:
${JSON.stringify(pedidoAntiguo, null, 2)}

SOLO DEVUELVE EL JSON MODIFICADO SEGUN LA INTERPRETACION NADA MAS
`;

    const response = await getByChatgpt35TurboByText(prompt);
    const respuesta = JSON.parse(response);

    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data;
    } else {
        return respuesta;
    }
};

module.exports = ChatModificarConfirmacion;
