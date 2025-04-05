const FlowManager = require('../../../FlowControl/FlowManager')
const ChatModificarPedido = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarPedido')

module.exports = async function ModificarPedido(userId, message, sock) {

    const data = await ChatModificarPedido(message, userId);
    const { obra_name, nro_compra, items } = data.data;

    // ⚠️ Verificar si items está vacío
    if (!items || items.length === 0) {
        await sock.sendMessage(userId, { text: "❌ No se detectaron productos válidos para el ingreso. Por favor, intentá nuevamente." });
        FlowManager.resetFlow(userId);
        return;
    }

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Ingreso* 📋\n\n 📄 *Número de compra:* ${nro_compra}\n\n 🏗️ Obra destino: ${obra_name} \n\n🛒 *Productos Detectados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ ¿Desea confirmar el Ingreso?\n\n1️⃣ *Sí*, confirmar ingreso\n2️⃣ *No*, realizar cambios\n3️⃣ *Cancelar*, cancelar operación"
    });

    FlowManager.setFlow(userId, "INGRESOMATERIALES", "ConfirmarOModificarIngreso", data);
}
