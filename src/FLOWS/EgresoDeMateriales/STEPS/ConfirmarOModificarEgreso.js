const opcionElegida = require("../../../Utiles/Chatgpt/Operaciones/opcionElegida");
const FlowManager = require('../../../FlowControl/FlowManager');
const realizarMovimientoRetiro = require('../../../Utiles/Helpers/EgresoMateriales/realizarMovimientoRetiro');
const obtenerDisponibilidad = require('../../../Utiles/Helpers/EgresoMateriales/obtenerDisponibilidad');
const enviarPDFWhatsApp = require('../../../Utiles/Helpers/EgresoMateriales/EnviarConformidad');

module.exports = async function ConfirmarOModificarEgreso(userId, message, sock) {
    const data = await opcionElegida(message);
    const flowData = FlowManager.userFlows[userId]?.flowData;

    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });

        // Lógica que controla la disponibilidad de stock.
        const Operacion = await obtenerDisponibilidad(flowData.data.obra_id, flowData.data.items);

        console.log(Operacion);

        switch (Operacion.Success) {
            case "Hay stock":
                await sock.sendMessage(userId, { text: `✅ La obra principal tiene suficiente stock para cubrir el pedido.` });
                const resultado = await realizarMovimientoRetiro(userId); // ← descomentar cuando esté listo
                await enviarPDFWhatsApp(resultado.FiletPath, sock, userId);
                FlowManager.resetFlow(userId);
                break;

            case "Otras obras":
                // Mostrar el mensaje generado por `obtenerDisponibilidad`
                await sock.sendMessage(userId, { text: Operacion.msg });
                await sock.sendMessage(userId, { text: listadoObras });

                // Habilitar el siguiente paso para que el usuario elija desde qué obra quiere el apoyo
                FlowManager.setFlow(userId, "EGRESOMATERIALES", "RetirarEgresoFiltrado", flowData);
                break;

            case "No stock":
                await sock.sendMessage(userId, { text: `🚫 ${Operacion.msg}` });
                FlowManager.resetFlow(userId);
                break;
        }

    } else if (data.data.Eleccion == "2") {
        await sock.sendMessage(userId, {
            text: "✏️ *Por favor, indique los cambios que desea realizar en su pedido.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._"
        });
        FlowManager.setFlow(userId, "EGRESOMATERIALES", "ModificarPedido", flowData);
    } else if (data.data.Eleccion == "3") {
        await sock.sendMessage(userId, { text: "❌ La operación ha sido cancelada." });
        FlowManager.resetFlow(userId);
    } else {
        await sock.sendMessage(userId, { text: "Disculpa, no lo he entendido." });
    }
};
