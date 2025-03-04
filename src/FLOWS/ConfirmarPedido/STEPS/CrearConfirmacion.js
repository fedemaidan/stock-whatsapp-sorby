const FlowManager = require('../../../FlowControl/FlowManager')

module.exports = async function CrearConfirmacion(userId, data, sock) {
    const { Nro_Pedido } = data.data;

    data = {
        "accion": "Crear Confirmacion",
        "data": {
            "Obra_id": 1,
            "Fecha":"27/2/2025",
            "Obra_Name": "Don Alberto",
            "Nro_compra": "00000",
            "Nro_Pedido": Nro_Pedido,
            "items": [
                {
                    "producto_id": 2,
                    "producto_name": "Bastidor Tablero",
                    "cantidad": 5
                },
                {
                    "producto_id": 10,
                    "producto_name": "Kalop Conductor Unipolar 1,5 MM Celeste",
                    "cantidad": 10
                }
            ]
        }
    };

    let output = `📋 Detalles de la Solicitud de Retiro 📋\n\n`;
    output += `📅 Fecha: 24/2/2025\n`;
    output += `🏗️ Número de retiro: ${data.data.Nro_Pedido}\n`;
    output += `📍 Obra destino: ${data.data.Obra_Name}\n\n`;
    output += `🛒 Productos Solicitados:\n`;

    data.data.items.forEach(item => {
        output += `🔹 ${item.producto_name}\n   📦 Cantidad: ${item.cantidad}*\n\n`;
    });

    await sock.sendMessage(userId, { text: output });

<<<<<<< HEAD
    const opciones = `¿En qué estado recibió el pedido? \n\n` +
        `1️⃣ *Perfecto*, no se registraron problemas\n` +
        `2️⃣ *Parcial*, hubo percances en cuanto al pedido\n` +
        `3️⃣ *Rechazado*, el pedido no se recibió`;

=======
    const opciones = `✅ Confirmación de Conformidad de Recepción ✅\n\n` +
        `Por favor, indique el estado en el que recibió el pedido:\n\n` +
        `1️⃣ *Recepción Conforme* - El pedido fue recibido en perfectas condiciones.\n` +
        `2️⃣ *Recepción Parcial* - Se detectaron irregularidades o faltantes.\n` +
        `3️⃣ *Rechazado* - El pedido no fue aceptado`;
>>>>>>> ff70c51 (Guardado antes de librerias)
    await sock.sendMessage(userId, { text: opciones });

    FlowManager.setFlow(userId, "CONFIRMARPEDIDO", "SeleccionarOpcion", data);
};