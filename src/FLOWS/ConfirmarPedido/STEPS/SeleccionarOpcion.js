const RecepcionDeRetiro = require("../../../Utiles/Chatgpt/Operaciones/RecepcionDeRetiro");
const FlowManager = require('../../../FlowControl/FlowManager')

module.exports = async function ConfirmarOModificarEgreso(userId, message, sock) {

    const data = await RecepcionDeRetiro(message);
    await sock.sendMessage(userId, { text: "🔄 *Procesando...*" });

    if (data.data.Eleccion == "1") {
        if (await realizarMovimientoRetiro(userId)) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        } else {
            await sock.sendMessage(userId, { text: "❌ Hubo un problema y no se continuó con el ingreso." });
        }

        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "2")

    { 
        await sock.sendMessage(userId, { text: "✏️ *Por favor, indique los cambios que desea realizar en su pedido.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._" });
        FlowManager.setFlow(userId, "EGRESOMATERIALES", "ModificarPedido", FlowManager.userFlows[userId]?.flowData)
        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "2")
    {


        FlowManager.resetFlow(userId)
    }
}