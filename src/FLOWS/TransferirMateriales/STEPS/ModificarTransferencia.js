const FlowManager = require('../../../FlowControl/FlowManager')
const ChatModificarPedido = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarPedido')

module.exports = async function ModificarTransferencia(userId, message, sock) {
    const data = await ChatModificarPedido(message, userId);
    const { obra_name_origen, obra_name_destino, items } = data.data;

    // ⚠️ Verificar si items está vacío
    if (!items || items.length === 0) {
        await sock.sendMessage(userId, { text: "❌ No se detectaron productos válidos para la transferencia. Por favor, intentá nuevamente." });
        FlowManager.resetFlow(userId);
        return;
    }

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Transferencia* 📋\n\n🏗️ *Obra Origen:* ${obra_name_origen}\n\n🏗️ *Obra Receptora:* ${obra_name_destino}\n\n🛒 *Productos Solicitados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ ¿Desea confirmar la transferencia?\n\n1️⃣ *Sí*, confirmar transferencia\n2️⃣ *No*, realizar cambios\n3️⃣ *Cancelar*, cancelar operación"
    });

    FlowManager.setFlow(userId, "TRANSFERENCIAMATERIALES", "ConfirmarOModificarTransferencia", data);
}
