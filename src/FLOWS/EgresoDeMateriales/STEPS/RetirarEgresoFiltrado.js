const FlowManager = require('../../../FlowControl/FlowManager')
const DetectarObra = require('../../../Utiles/Chatgpt/Operaciones/DetectarObra')

module.exports = async function ModificarPedido(userId, message, sock) {

    const data = await DetectarObra(message, userId);

    const {obra_name} = data.data;
    const pedido = FlowManager.userFlows[userId]?.flowData;
    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Retiro* 📋\n\n🏗️ *Obra:* ${obra_name}\n *Obra secundaria:* ${pedido.data.obra_name}\n\n `;

    await sock.sendMessage(userId, { text: output });
    await sock.sendMessage(userId, { text: `🔄 Procesando... ` });








    FlowManager.setFlow(userId, "EGRESOMATERIALES", "ConfirmarOModificarEgreso", data)
}


