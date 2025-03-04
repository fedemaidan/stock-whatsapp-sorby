const RecepcionDeRetiro = require("../../../Utiles/Chatgpt/Operaciones/RecepcionDeRetiro");
const FlowManager = require('../../../FlowControl/FlowManager')
const AprobarPedido = require('../../../Utiles/Helpers/ConfirmarPedido/AprobarPedido')
const RechazarPedido = require('../../../Utiles/Helpers/ConfirmarPedido/RechazarPedido')

module.exports = async function SeleccionarOpcion(userId, message, sock) {

    const data = await RecepcionDeRetiro(message);
    await sock.sendMessage(userId, { text: "🔄 Procesando..." });

    if (data.data.Eleccion == "1") {
        //await AprobarPedido(operacion)
        await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "2")
    { 
        await sock.sendMessage(userId, { text: "✏️ *Por favor, indique cual fue el problema del pedido.*\n \nEJ:Faltaron los tornillos, 3 bastidores no llegaron." });
        FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "RecepcionParcial", FlowManager.userFlows[userId]?.flowData)
    }
    else if (data.data.Eleccion == "3")
    {
        await sock.sendMessage(userId, { text: "❌ El pedido ha sido completamente rechazado y los materiales serán devueltos a GENERAL." });
        //await RechazarPedido(operacion)
        FlowManager.resetFlow(userId)
    }
}