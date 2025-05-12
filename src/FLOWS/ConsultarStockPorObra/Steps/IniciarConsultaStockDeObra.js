const FlowManager = require('../../../FlowControl/FlowManager');
const stockPorObra = require('../../../Utiles/Helpers/ConsultarStock/stockPorObra');

module.exports = async function IniciarConsultaStock(userId, data, sock) {
    const { id_obra } = data.data;

    const stockData = await stockPorObra(id_obra);
    const { nombre_obra, materiales } = stockData || {};

    if (!materiales || materiales.length === 0) {
        await sock.sendMessage(userId, { text: '❌ No se encontró stock disponible en esta obra.' });
        FlowManager.resetFlow(userId);
        return;
    }

    let output = `🏗️ *Stock actual en la obra ${nombre_obra}*\n━━━━━━━━━━━━━━━━━━━━━━\n`;

    materiales.forEach((item, index) => {
        output += `\n🔹 *${index + 1}. Material:* ${item.nombre}\n`;
        output += `📦 *Cantidad:* ${item.cantidad}\n`;
        output += `📄 *SKU:* ${item.SKU || 'No especificado'}\n`;
        output += `────────────────────────────\n`;
    });

    await sock.sendMessage(userId, { text: output });
    FlowManager.resetFlow(userId);
};
