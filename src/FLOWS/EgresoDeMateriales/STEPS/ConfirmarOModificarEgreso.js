const opcionElegida  = require("../../../Utiles/Chatgpt/Operaciones/opcionElegida");
const FlowManager = require('../../../FlowControl/FlowManager')
const realizarMovimientoRetiro = require('../../../Utiles/Helpers/EgresoMateriales/realizarMovimientoRetiro');  // Verifica la ruta aquí
const enviarPDFWhatsApp = require('../../../Utiles/Helpers/EgresoMateriales/EnviarConformidad');

module.exports = async function ConfirmarOModificarEgreso(userId,message, sock) {

    const data = await opcionElegida(message);

    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });

        const Operacion = await realizarMovimientoRetiro(userId)
        if (Operacion.Success) { 
            await enviarPDFWhatsApp(sock, userId)
            await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });

        } else
        {
            await sock.sendMessage(userId, { text: Operacion.msg });
        }

        FlowManager.resetFlow(userId)
    }
    else {
        await sock.sendMessage(userId, {text:"✏️ *Por favor, indique los cambios que desea realizar en su pedido.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._"});
        FlowManager.setFlow(userId, "EGRESOMATERIALES", "ModificarPedido", FlowManager.userFlows[userId]?.flowData)
    }
}