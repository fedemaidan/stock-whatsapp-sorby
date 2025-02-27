const FlowManager = require('../../../FlowControl/FlowManager')
const ChatModificarConfirmacion = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarConfirmacion')
const AprobarParcial = require('../../../Utiles/Helpers/ConfirmarPedido/AprobarParcial')
module.exports = async function RecepcionParcial(userId, message, sock) {

    const data = await ChatModificarConfirmacion(message, userId);
    const { obra_id, obra_name, items, Nro_Pedido } = data.data;

    let output = `📋 *Detalles de la Solicitud de Retiro* 📋\n\n`;
    output += `📅 *Fecha:* 24/2/2025\n`;
    output += `🏗️ *Número de retiro:* ${data.data.Nro_Pedido}\n`;
    output += `📍 *Obra destino:* ${data.data.obra_name}\n\n`;
    output += `🛒 *Productos Solicitados:*\n`;

    data.data.items.forEach(item => {
        output += `🔹 *${item.producto_name}*\n   📦 Cantidad: *${item.cantidad}*\n\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ *La operación finalizó exitosamente.*"
    });
    //await AprobarParcial(operacion)
    FlowManager.resetFlow(userId)
}