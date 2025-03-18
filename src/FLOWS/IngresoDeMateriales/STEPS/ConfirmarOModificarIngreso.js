const opcionElegida = require("../../../Utiles/Chatgpt/Operaciones/opcionElegida");
const FlowManager = require('../../../FlowControl/FlowManager')
const realizarMovimientoIngreso = require('../../../Utiles/Helpers/IngresoMateriales/realizarMovimientoIngreso');  // Verifica la ruta aquí
const enviarPDFWhatsApp = require('../../../Utiles/Helpers/EgresoMateriales/EnviarConformidad');

module.exports = async function ConfirmarOModificarEgreso(userId, message, sock) {

    const data = await opcionElegida(message);

    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });

        const Operacion = await realizarMovimientoIngreso(userId)
        if (Operacion.Success) {
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });

        } else {
            await sock.sendMessage(userId, { text: Operacion.msg });
        }
        FlowManager.resetFlow(userId)
    }
    else if (data.data.Eleccion == "2") {
        await sock.sendMessage(userId, { text: "✏️ *Por favor, indique los cambios que desea realizar en su pedido.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._" });
        FlowManager.setFlow(userId, "INGRESOMATERIALES", "ModificarIngreso", FlowManager.userFlows[userId]?.flowData)
    } else if (data.data.Eleccion == "3") {
        await sock.sendMessage(userId, { text: "la operación ha sido cancelada. ❌" });
        FlowManager.resetFlow(userId)
    } else
    {
        await sock.sendMessage(userId, { text: "Disculpa, no lo he entendido" });
    }
}