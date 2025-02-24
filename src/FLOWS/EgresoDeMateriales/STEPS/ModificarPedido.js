const FlowManager = require('../../../FlowControl/FlowManager')
module.exports = async function ModificarPedido(userId, data, sock)
{
    const { obra_id, obra_name, items } = data.data;

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Retiro* 📋\n\n🏗️ *Obra:* ${obra_name}\n\n🛒 *Productos Solicitados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ *¿Desea confirmar el pedido?* ✅\n\n1️⃣ *Sí, confirmar pedido*\n2️⃣ *No, realizar cambios*"
    });
    //userId, flowName, initialStep = 0, flowData = {}//
    FlowManager.setFlow(userId, "EGRESOMATERIALES", "ConfirmarOModificarEgreso", data)
}