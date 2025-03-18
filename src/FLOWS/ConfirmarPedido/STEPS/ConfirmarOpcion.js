const AprobarParcial = require('../../../Utiles/Helpers/ConfirmarPedido/AprobarParcial');
const opcionElegida = require('../../../Utiles/Chatgpt/Operaciones/opcionElegida')
const FlowManager = require('../../../FlowControl/FlowManager');

module.exports = async function ConfirmarOpcion(userId, message, sock) {

    const data = await opcionElegida(message);

    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });

        const Operacion = await AprobarParcial(userId)
        if (Operacion.Success) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        } else {
            await sock.sendMessage(userId, { text: Operacion.msg });
        }
        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "2") {
        await sock.sendMessage(userId, { text: "la operación ha sido cancelada. ❌" });
        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "3") {
        await sock.sendMessage(userId, { text: "la operación ha sido cancelada. ❌" });
        FlowManager.resetFlow(userId)
    } else {
        await sock.sendMessage(userId, { text: "Disculpa, no lo he entendido." });
    }
}