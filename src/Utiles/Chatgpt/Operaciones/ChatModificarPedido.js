const { getByChatgpt35TurboByText } = require("../Base");
const FlowManager = require('../../../../src/FlowControl/FlowManager')
const { obtenerTodosLosMateriales } = require('../../BDServices/Funciones/FuncionesMaterial');
const { obtenerTodasLasObras } = require('../../BDServices/Funciones/FuncionesObra');

const ChatModificarPedido = async (message, userId) => {

    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;
    const materiales = await obtenerTodosLosMateriales();
    const Obras = await obtenerTodasLasObras()

    prompt = `
Como bot de gestión de pedidos de retiro de materiales, debo actualizar el pedido según los cambios solicitados por el usuario, sin sobreescribir completamente el pedido anterior. Para ello, debo interpretar la solicitud y aplicar una de las siguientes acciones:

1. **Agregar un nuevo producto:** Solo si el producto solicitado **existe en el stock** con una coincidencia alta en el nombre.  
2. **Sumar cantidad:** Si el producto ya existe en el pedido y el usuario indica "agregar" o "sumar", incrementar la cantidad existente.  
3. **Quitar o eliminar:** Si el usuario indica "quitar" o "eliminar" un producto, reducir la cantidad o eliminarlo completamente si la cantidad a quitar es igual o mayor a la existente.  
4. **Modificar cantidad:** Si el usuario pide cambiar la cantidad de un producto, actualizar la cantidad a la solicitada.  
5. **Modificar la obra:** Si el usuario pide cambiar la obra por otra debes buscar en el listado de obras y interpretar a cual se refiere si no lo pide no lo cambies.
6. **Modificar nro compra:** Si el usuario pide cambiar el nro de compra modificalo por el solicitado si no lo pide no lo cambies.

### **Reglas de Coincidencia:**
- Solo se agregará un producto si su nombre en el stock tiene **una coincidencia alta** con la solicitud del usuario.  
- La coincidencia se calcula basándose en las palabras clave contenidas en el producto.  
- Si hay múltiples coincidencias, se elige la que tenga **más palabras coincidentes**.  
- **No se agregan productos si la coincidencia es baja o si no está en el stock disponible.**  
- No se deben modificar otros productos en el pedido a menos que el usuario lo solicite explícitamente.  

**Ejemplo de coincidencias aceptadas:**  
✅ **"Kalop unipolar 1,5mm blanco"** → **"Kalop Conductor Unipolar 1,5MM Blanco"** (coincidencia alta)  
✅ **"termica 2x16"** → **"Abb Termica Din 2x16"** (coincidencia alta)  
❌ **"cable azul"** → **No se agrega si no hay una coincidencia exacta en el stock**  

Formato de respuesta: Devuelve exclusivamente un JSON con el pedido actualizado, sin incluir texto adicional. 
Mensaje del cliente: "${message}"

Pedido antiguo: ${JSON.stringify(pedidoAntiguo, null, 2)}
Stock disponible: ${JSON.stringify(materiales, null, 2)}
Obras disponibles: ${JSON.stringify(Obras, null, 2)}
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

module.exports = ChatModificarPedido;