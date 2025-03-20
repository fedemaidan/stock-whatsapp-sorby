const FlowManager = require('../../../FlowControl/FlowManager')

module.exports = async function CrearConfirmacion(userId, data, sock) {

    // Obtenemos los detalles del pedido
    const pedido = FlowManager.userFlows[userId]?.flowData

    if (!pedido) {
        await sock.sendMessage(userId, { text: '❌ No se pudo encontrar el pedido.' });
        FlowManager.resetFlow(userId)
        return; // Termina la ejecución si no se encuentra el pedido
    }

    // Creamos el mensaje con los detalles del pedido
    let output = `📋 Detalles de la Solicitud de Retiro 📋\n\n`;

    const fechaFormateada = new Date(pedido.Fecha).toISOString().split('T')[0];
    output += `📅 Fecha: ${fechaFormateada}\n`;


    output += `🏗️ Número de retiro: ${pedido.Nro_Pedido}\n`;
    output += `📍 Obra destino: ${pedido.movimientos[0]?.obra_destino || 'No definida'}\n\n`; // Usamos la obra destino del primer movimiento (si existe)

    output += `🛒 Productos Solicitados:\n`;

    // Iteramos sobre los movimientos del pedido y mostramos los productos
    pedido.movimientos.forEach(movimiento => {
        output += `🔹 ${movimiento.producto_name}\n   📦 Cantidad: ${movimiento.cantidad}\n\n`; // Nombre del material y cantidad
    });

    // Enviamos el mensaje con los detalles
    await sock.sendMessage(userId, { text: output });

    // Creamos las opciones de confirmación
    const opciones = `✅ Confirmación de Conformidad de Recepción ✅\n\n` +
        `Por favor, indique el estado en el que recibió el pedido:\n\n` +
        `1️⃣ *Recepción Conforme* - El pedido fue recibido en perfectas condiciones.\n` +
        `2️⃣ *Recepción Parcial* - Se detectaron irregularidades o faltantes.\n` +
        `3️⃣ *Rechazado* - El pedido no fue aceptado\n` +
        `4️⃣ *Salir*`;

    // Enviamos las opciones de confirmación
    await sock.sendMessage(userId, { text: opciones });

    // Establecemos el flujo para esperar la respuesta del usuario
    FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "SeleccionarOpcion", pedido);
};
