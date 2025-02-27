const { getByChatgpt35TurboByText } = require("../Base");
const FlowManager = require('../../../../src/FlowControl/FlowManager')

const ChatModificarConfirmacion = async (message, userId) => {

    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    prompt = `
Como bot de gestión de pedidos de retiro de materiales, debo actualizar el pedido según los cambios solicitados por el usuario, sin sobreescribir completamente el pedido anterior. Para ello, debo interpretar la solicitud y aplicar una de las siguientes acciones:

3. **Quitar o eliminar:** Si el usuario indica "quitar" o "eliminar" o algun sinonimo un producto, reducir la cantidad o eliminarlo completamente si la cantidad a quitar es igual o mayor a la existente.  
4. **Modificar cantidad:** Si el usuario pide cambiar la cantidad de un producto, actualizar la cantidad a la solicitada.  

**Ejemplo de coincidencias aceptadas:**  
"Los bastidores no llegaron debo buscar la coincidencia en los productos con bastidores y eliminarlos del resumen"

Formato de respuesta: Devuelve exclusivamente un JSON con el pedido actualizado, sin incluir texto adicional. 
Mensaje del cliente: "${message}"

Pedido: ${JSON.stringify(pedidoAntiguo, null, 2)}
`;

    const response = await getByChatgpt35TurboByText(prompt);
    const respuesta = JSON.parse(response);

    if (respuesta.hasOwnProperty('json_data')) {
        return respuesta.json_data
    }
    else {
        return respuesta
    }
}

module.exports = ChatModificarConfirmacion;