const AprobarParcial = require('../../../Utiles/Helpers/ConfirmarPedido/AprobarParcial');
const opcionElegida = require('../../../Utiles/Chatgpt/Operaciones/opcionElegida')
const FlowManager = require('../../../FlowControl/FlowManager');
const RepetirCrearConfirmacion = require('../../ConfirmarPedido/STEPS/RepetirCrearConfirmacion');

module.exports = async function ConfirmarOpcion(userId, message, sock) {

    const data = await opcionElegida(message);

    const { Dataoriginal, datamodificado } = FlowManager.userFlows[userId]?.flowData

    if (data.data.Eleccion == "1")
    {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });

        Datosoriginales = Dataoriginal
        FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "ConfirmarOpcion", datamodificado)
        const Operacion = await AprobarParcial(userId)

        if (Operacion.Success) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });
        } else {
            await sock.sendMessage(userId, { text: Operacion.msg });
        }
        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "2")
    {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });
        FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "RepetirCrearConfirmacion", Dataoriginal)
        RepetirCrearConfirmacion(userId,message,sock)
    }
    else if (data.data.Eleccion == "3")
    {
        await sock.sendMessage(userId, { text: "❌ La operación fue cancelada." });
        FlowManager.resetFlow(userId)
    }
}