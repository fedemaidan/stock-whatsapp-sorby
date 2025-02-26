const opcionElegida = require("../../../Utiles/Chatgpt/Operaciones/opcionElegida");
const FlowManager = require('../../../FlowControl/FlowManager')
const  realizarMovimientoIngreso  = require('../../../Utiles/Helpers/IngresoMateriales/realizarMovimientoIngreso');  // Verifica la ruta aquí

module.exports = async function ConfirmarOModificarIngreso(userId, message, sock) {

    const data = await opcionElegida(message);

    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 *Procesando...*" });

        if (await realizarMovimientoIngreso(userId)) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        }
        else
        {
            await sock.sendMessage(userId, { text: "❌ Hubo un problema y no se continuó con el ingreso." });
        }
        FlowManager.resetFlow(userId)
    }
    else {
        await sock.sendMessage(userId, { text: "✏️ *Por favor, indique los cambios que desea realizar en su ingreso.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._" });
        FlowManager.setFlow(userId, "INGRESOMATERIALES", "ModificarIngreso", FlowManager.userFlows[userId]?.flowData)
    }
}