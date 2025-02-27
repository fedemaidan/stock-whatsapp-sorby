const FlowManager = require('../../../FlowControl/FlowManager')

module.exports = async function CrearConfirmacion(userId, data, sock)
{
    const { Nro_Pedido } = data.data;

    let output = `📋 *Detalles de la Solicitud de Retiro* 📋\n\n🏗️ *Numero de retiro:* ${Nro_Pedido}\n\n🛒 *Productos Solicitados:*\n`;



    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });
    await sock.sendMessage(userId, { text: "✅ *¿En que estado recibio el pedido?* ✅\n\n1️⃣ *Perfecto, no se registraron problemas* \n2️⃣ *Parcial, Ah habido percanses en cuanto al pedido*\ 3️⃣ *Rechazado, el pedido no se recibio*" });
    FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "SeleccionarOpcion", data)
}
