const FlowManager = require('../../../FlowControl/FlowManager');

module.exports = async function CrearIngreso(userId, data, sock) {
    const { obra_name, items } = data.data;
    let { nro_compra } = data.data;

    console.log("Dentro de ingreso materiales.");
    console.log(obra_name);

    // Validamos el número de compra
    const mostrarNroCompra = nro_compra && nro_compra !== "00000" && nro_compra !== "-";

    // Creamos el string del mensaje
    let output = `📋 *Detalles de la Solicitud de Ingreso* 📋\n\n`;

    if (mostrarNroCompra) {
        output += `📄 *Número de compra:* ${nro_compra}\n\n`;
    }

    output += `🏗️ Obra destino: ${obra_name} \n\n🛒 *Productos Detectados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, {
        text: "✅ ¿Desea confirmar el Ingreso?\n\n1️⃣ *Sí*, confirmar ingreso\n2️⃣ *No*, realizar cambios\n3️⃣ *Cancelar*, cancelar operación"
    });

    FlowManager.setFlow(userId, "INGRESOMATERIALES", "ConfirmarOModificarIngreso", data);
}
