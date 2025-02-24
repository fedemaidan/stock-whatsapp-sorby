const { getByChatgpt35TurboByText } = require("./base");
const stock = require("../MaterialsService");
const Obras = require("../ObrasService");
const FlowManager = require('../../FlowControl/FlowManager')

const opciones = [
    {
        accion: "CrearEgreso",
        data:
        {
            obra_id: 1,
            obra_name: "El nombre de la obra / identificacion hacia donde iran los materiales",
            items: [{ producto_id: "id del producto al que me estoy refiriendo", producto_name: "nombre del producto al que me estoy refiriendo", cantidad: "Cantidad de este material indicado" },]
        }
    }, 
    {
        accion: "CrearIngreso",
        data:
        {
            obra_id: 1,
            obra_name: "Las toscas",
            items: [{ producto_id: 1, producto_name: "Cable", cantidad: 10 }, { producto_id: 2, producto_name: "Fierro", cantidad: 5 }]
        }
    },
    {
        accion: "Confirmar",
        data:
        {
            Eleccion: "El interpreta como 1 para Si, continuar, acepto, (Emoji manito arriba) etc Y 2 para no, detener, para, No (emoji manito abajo) etc"
        }
    }
];

// Servicio para analizar la intención del mensaje
const analizarIntencion = async (message, userId) => {

    const opcionesTxt = JSON.stringify(opciones);
    const step = FlowManager.userFlows[userId]?.currentStep;

    let prompt = ""
    try {
            switch (step) {
                case "ModificarPedido":
                    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;
                    prompt = `
Como bot de gestión de pedidos de retiro de materiales, debo actualizar el pedido según los cambios solicitados por el usuario, sin sobreescribir completamente el pedido anterior. Para ello, debo interpretar la solicitud y aplicar una de las siguientes acciones:

1. **Agregar un nuevo producto:** Solo si el producto solicitado **existe en el stock** con una coincidencia alta en el nombre.  
2. **Sumar cantidad:** Si el producto ya existe en el pedido y el usuario indica "agregar" o "sumar", incrementar la cantidad existente.  
3. **Quitar o eliminar:** Si el usuario indica "quitar" o "eliminar" un producto, reducir la cantidad o eliminarlo completamente si la cantidad a quitar es igual o mayor a la existente.  
4. **Modificar cantidad:** Si el usuario pide cambiar la cantidad de un producto, actualizar la cantidad a la solicitada.  

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
Stock disponible: ${JSON.stringify(stock, null, 2)}
Obras disponibles: ${JSON.stringify(Obras, null, 2)}
`;
                    break;

                case "ConfirmarOModificarEgreso":
                    prompt = `
Como bot de un sistema de control de stock, quiero identificar la intención del usuario y ejecutar la acción adecuada para gestionar correctamente la confirmación o cancelación de pedidos.

Formato de respuesta: Devuelve exclusivamente un JSON modificando los datos dependiendo de la interpretación, sin incluir texto adicional.

Advertencia:
- Si el usuario responde con "1", "Sí", "Confirmar", "Aceptar", "👍", "✅", "✔️" o números con emojis (ej. "1️⃣"), se interpretará como confirmación del pedido y se debe asignar el valor numérico 1 en el campo "Eleccion".
- Si el usuario responde con "2", "No", "Cancelar", "Rechazar", "👎", "❌", "✖️" o números con emojis (ej. "2️⃣"), se interpretará como cancelación del pedido y se debe asignar el valor numérico 2 en el campo "Eleccion".

Resumen del contexto: Soy un bot encargado de gestionar el stock de productos y validar la intención del usuario con respecto a la confirmación o cancelación de pedidos.

El usuario dice: "${message}"

Formato de respuesta esperado (EXCLUSIVAMENTE JSON, sin texto adicional):
${JSON.stringify(opciones[2], null, 2)}
`;
                    break;

                default:
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
                    break;
            }
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
