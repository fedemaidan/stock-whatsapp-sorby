const RecepcionDeRetiro = require("../../../Utiles/Chatgpt/Operaciones/RecepcionDeRetiro");
const FlowManager = require('../../../FlowControl/FlowManager');
const AprobarPedido = require('../../../Utiles/Helpers/ConfirmarPedido/AprobarPedido');
const RechazarPedido = require('../../../Utiles/Helpers/ConfirmarPedido/RechazarPedido');

module.exports = async function SeleccionarOpcion(userId, message, sock) {
    const data = await RecepcionDeRetiro(message);
    await sock.sendMessage(userId, { text: "🔄 Procesando..." });

    if (data.data.Eleccion == "1") {
        const Operacion1 = await AprobarPedido(userId);  // 🔹 Pasamos userId correctamente

        if (Operacion1.Success) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        } else {
            await sock.sendMessage(userId, { text: Operacion1.msg });  // 🔹 Corregimos la variable
        }

        FlowManager.resetFlow(userId);
    }
    else if (data.data.Eleccion == "2") {
        await sock.sendMessage(userId, {
            text: "✏️ Por favor, indique cuál fue el problema del pedido.\n\nEJ: Faltaron los tornillos, 3 bastidores no llegaron."
        });
        FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "RecepcionParcial", FlowManager.userFlows[userId]?.flowData);
    }
    else if (data.data.Eleccion == "3") {
        const Operacion2 = await RechazarPedido(userId);  // 🔹 Pasamos userId correctamente

        if (Operacion2.Success) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        } else {
            await sock.sendMessage(userId, { text: Operacion2.msg });  // 🔹 Corregimos la variable
        }

        FlowManager.resetFlow(userId);
    }
    else if (data.data.Eleccion == "4") {
        await sock.sendMessage(userId, { text: "la operación ha sido cancelada. ❌" });
        FlowManager.resetFlow(userId)
    }
    else {
        await sock.sendMessage(userId, { text: "Disculpa, no lo he entendido." });
    }
};
