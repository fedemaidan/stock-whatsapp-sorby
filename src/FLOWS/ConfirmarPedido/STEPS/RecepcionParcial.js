const FlowManager = require('../../../FlowControl/FlowManager');
const ChatModificarConfirmacion = require('../../../Utiles/Chatgpt/Operaciones/ChatModificarConfirmacion');


module.exports = async function RecepcionParcial(userId, message, sock) {

    //modificado
    const data = await ChatModificarConfirmacion(message, userId);

    if (!data) {
        console.error(`Error: No se recibió respuesta de ChatModificarConfirmacion para userId: ${userId}`);
        await sock.sendMessage(userId, { text: "❌ Ocurrió un error al procesar la solicitud." });
        return;
    }

    const { nro_pedido: Nro_Pedido, aprobados, rechazados, aclaracion } = data;

    // Verificar si `aprobados` es un array
    if (!Array.isArray(aprobados)) {
        console.error(`Error: 'aprobados' no es un array o está undefined para el usuario ${userId}`);
        console.error('Datos recibidos:', data);
        await sock.sendMessage(userId, { text: "❌ Ocurrió un error al procesar los productos aprobados." });
        return;
    }

    // Mensaje de productos aprobados
    let output = `📋 Detalles de la Solicitud de Retiro 📋\n\n`;
    const fechaFormateada = data.fecha.toISOString().split('T')[0];

    output += `📅 Fecha: ${fechaFormateada}\n`;

    output += `🏗️ Número de retiro: ${Nro_Pedido}\n`;
    output += `📍 Obra destino: ${aprobados[0]?.obra_destino || aprobados[0]?.obra_origen}\n\n`;
    output += `🛒 Productos Aprobados:\n`;

    aprobados.forEach(item => {
        output += `🔹 ${item.producto_name}\n   📦 Cantidad: ${item.cantidad}\n\n`;
    });

    await sock.sendMessage(userId, { text: output });

    // Mensaje de productos rechazados
    if (Array.isArray(rechazados) && rechazados.length > 0) {
        let outputRechazados = `⚠️ Productos rechazados ⚠️\n\n`;
        outputRechazados += `Los siguientes productos no fueron aprobados:\n\n`;

        rechazados.forEach(item => {
            outputRechazados += `❌ ${item.producto_name}\n   🚫 Cantidad rechazada: ${item.cantidad}\n\n`;
        });

        outputRechazados += `📝 Aclaración: "${aclaracion}"\n\n`;
        await sock.sendMessage(userId, { text: outputRechazados });
    }

    await sock.sendMessage(userId, {
        text: "✅ ¿Desea confirmar el pedido?\n\n1️⃣ *Sí*, confirmar pedido\n2️⃣ *No*, volver atras\n3️⃣ *Salir*" });


    FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "ConfirmarOpcion", {Dataoriginal:FlowManager.userFlows[userId]?.flowData, datamodificado: data});
    console.log(FlowManager.userFlows[userId]?.flowData)
};     