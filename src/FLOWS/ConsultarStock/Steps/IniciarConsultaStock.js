const FlowManager = require('../../../FlowControl/FlowManager');
const MaterialPorObra = require('../../../Utiles/Helpers/ConsultarStock/MaterialPorObra');

module.exports = async function IniciarConsultaStock(userId, data, sock) {
    const { id_material } = data.data;

    // Obtenemos los detalles del stock
    const stock = await MaterialPorObra(id_material);

    if (!stock) {
        await sock.sendMessage(userId, { text: '❌ No se pudo obtener el stock del material.' });
        FlowManager.resetFlow(userId);
        return;
    }

    // Construimos el mensaje con los detalles del stock
    let output = `📦 *Detalles del Stock del Material* 📦\n\n`;
    output += `📌 *Nombre:* ${stock.nombre_material}\n`;
    output += `📊 *Stock Total:* ${stock.total}\n\n`;

    if (stock.obras.length === 0||stock.total==0) {
        output += `❌ No hay stock disponible en ninguna obra.\n`;
    } else {
        output += `🏗️ *Stock por Obra:*\n`;
        stock.obras.forEach(obra => {
            output += `   -------------------------------\n\n`;
            output += `   🔹 *Obra:* ${obra.nombre}\n`;
            output += `   📦 *Cantidad:* ${obra.cantidad}\n\n`;
        });
    }

    // Enviamos el mensaje con los detalles
    await sock.sendMessage(userId, { text: output });

    // Restablecemos el flujo para la siguiente interacción
    FlowManager.resetFlow(userId);
};
