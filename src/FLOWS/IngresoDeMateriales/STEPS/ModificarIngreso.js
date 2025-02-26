const FlowManager = require('../../../FlowControl/FlowManager')
const ChatModificarPedido = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarPedido')
module.exports = async function ModificarPedido(userId, message, sock) {

    const data = await ChatModificarPedido(message, userId);

    const { Obra_id, Obra_name, Nro_compra, Nro_Pedido, items } = data.data;

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Ingreso* 📋\n\n 📄 *Numero de compra:* ${Nro_compra}\n\n 🏗️ Obra destino: ${Obra_name} \n\n🛒 *Productos Detectados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ *¿Desea confirmar el Ingreso?* ✅\n\n1️⃣ *Sí, confirmar ingreso*\n2️⃣ *No, realizar cambios*"
    });
    //userId, flowName, initialStep = 0, flowData = {}//
    FlowManager.setFlow(userId, "INGRESOMATERIALES", "ConfirmarOModificarIngreso", data)
}