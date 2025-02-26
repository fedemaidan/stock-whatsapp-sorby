const FlowManager = require('../../../FlowControl/FlowManager')
module.exports = async function CrearIngreso(userId, data, sock) {

    const { Obra_id, Obra_name,Nro_compra,Nro_Pedido, items } = data.data;

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de Ingreso* 📋\n\n 📄 *Numero de compra:* ${Nro_compra}\n\n 🏗️ Obra destino: ${Obra_name} \n\n🛒 *Productos Detectados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, { text: "✅ *¿Desea confirmar el Ingreso?* ✅\n\n1️⃣ *Sí, confirmar ingreso*\n2️⃣ *No, realizar cambios*" });

    FlowManager.setFlow(userId, "INGRESOMATERIALES", "ConfirmarOModificarIngreso", data)
}
