const FlowManager = require('../../../FlowControl/FlowManager')
module.exports = async function CrearEgreso(userId, data, sock)
{
    const {obra_name, items } = data.data;

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Retiro* 📋\n\n🏗️ *Obra:* ${obra_name}\n\n🛒 *Productos Solicitados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, { text: "✅ ¿Desea confirmar el Egreso?\n\n1️⃣ *Sí*, confirmar Egreso\n2️⃣ *No*, realizar cambios\n3️⃣ *Cancelar*, cancelar operación" });

    FlowManager.setFlow(userId, "EGRESOMATERIALES", "ConfirmarOModificarEgreso", data)
}
