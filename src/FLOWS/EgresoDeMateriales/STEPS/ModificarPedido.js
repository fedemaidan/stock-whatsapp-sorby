const FlowManager = require('../../../FlowControl/FlowManager')
const ChatModificarPedido = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarPedido')
module.exports = async function ModificarPedido(userId, message, sock)
{

    const data = await ChatModificarPedido(message, userId);

    const { obra_id, obra_name, items } = data.data;

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Retiro* 📋\n\n🏗️ *Obra:* ${obra_name}\n\n🛒 *Productos Solicitados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ ¿Desea confirmar el Egreso?\n\n1️⃣ *Sí*, confirmar ingreso\n2️⃣ *No*, realizar cambios\n3️⃣ *Cancelar*, cancelar operación"
    });
    //userId, flowName, initialStep = 0, flowData = {}//
    FlowManager.setFlow(userId,"EGRESOMATERIALES","ConfirmarOModificarEgreso",data)
}