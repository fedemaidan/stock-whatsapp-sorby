const FlowManager = require('../../../FlowControl/FlowManager')
const ChatModificarConfirmacion = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarConfirmacion')
const AprobarParcial = require('../../../Utiles/Helpers/ConfirmarPedido/AprobarParcial')
module.exports = async function RecepcionParcial(userId, message, sock) {
    const data = await ChatModificarConfirmacion(message, userId);
    const { obra_id, obra_name, items, Nro_Pedido } = data.data;

    // Mensaje de productos aprobados
    let output = `📋 Detalles de la Solicitud de Retiro 📋\n\n`;
    output += `📅 Fecha: 24/2/2025\n`;
    output += `🏗️ Número de retiro: ${Nro_Pedido}\n`;
    output += `📍 Obra destino: ${obra_name}\n\n`;
    output += `🛒 Productos Aprobados:\n`;

    items.forEach(item => {
        output += `🔹 ${item.producto_name}\n   📦 Cantidad: ${item.cantidad}\n\n`;
    });

    await sock.sendMessage(userId, { text: output });

    // Mensaje de productos no aprobados
    if (data.eliminados?.items?.length > 0) {
        let outputEliminados = `⚠️ Modificaciones en su solicitud ⚠️\n\n`;
        outputEliminados += `Algunos productos fueron ajustados o eliminados según las condiciones establecidas:\n\n`;

        data.eliminados.items.forEach(item => {
            outputEliminados += `❌ ${item.producto_name}\n   🚫 *Cantidad afectada: ${item.cantidad}\n\n`;
        });

        outputEliminados += `📝 Aclaración: "${data.eliminados.aclaracion}"\n\n`;
        await sock.sendMessage(userId, { text: outputEliminados });
    }

    await sock.sendMessage(userId, { text: "✅ La operación finalizó exitosamente." });

    // await AprobarParcial(operacion)
    FlowManager.resetFlow(userId);
};