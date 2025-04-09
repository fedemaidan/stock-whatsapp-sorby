const FlowManager = require('../../../FlowControl/FlowManager');
const ObtenerConsultaPedido = require('../../../Utiles/Helpers/ConsultarPedido/ObtenerConsultaPedido');

module.exports = async function IniciarConsulta(userId, data, sock) {
    const { Nro_Pedido } = data.data;

    const pedido = await ObtenerConsultaPedido(Nro_Pedido);

    if (!pedido) {
        await sock.sendMessage(userId, { text: '❌ No se pudo encontrar el pedido.' });
        FlowManager.resetFlow(userId);
        return;
    }

    const fechaFormateada = new Date(pedido.Fecha).toISOString().split('T')[0];

    // Partes del mensaje
    let mensajeBase = `📋 *Detalles de la Solicitud* 📋\n\n`;
    mensajeBase += `📅 *Fecha:* ${fechaFormateada}\n`;
    mensajeBase += `🏗️ *Número de retiro:* ${pedido.Nro_Pedido}\n\n`;
    mensajeBase += `📄 *Estado:* ${pedido.Estado}\n`;
    mensajeBase += `🏗️ *Aclaración del pedido:* \n${pedido.Aclaracion}\n\n`;

    // Movimientos por estado
    const egresosAprobados = pedido.movimientos.filter(m =>
        (m.tipo === 'Egreso' || m.tipo === 'Transferencia') && m.estado === 'Aprobado'
    );
    const egresosRechazados = pedido.movimientos.filter(m => m.estado === 'Rechazado');
    const movimientosEnProceso = pedido.movimientos.filter(m =>
        m.estado !== 'Aprobado' && m.estado !== 'Rechazado'
    );

    const organizarMovimientos = (titulo, movimientos) => {
        let output = `📄 *${titulo}*\n`;
        movimientos.forEach(mov => {
            output += `   🔹 ${mov.producto_name}\n   📦 *Cantidad:* ${mov.cantidad}\n`;
            if (mov.tipo === 'Transferencia' || mov.obra_origen) {
                output += `   🏗️ *Obra Origen:* ${mov.obra_origen}\n`;
            }
            if (mov.obra_destino) {
                output += `   🎯 *Obra Destino:* ${mov.obra_destino}\n`;
            }
            output += `\n`;
        });
        return output;
    };

    // Armado del mensaje final
    let mensajeFinal = mensajeBase;

    if (egresosAprobados.length > 0) {
        mensajeFinal += organizarMovimientos('Egresos Aprobados', egresosAprobados);
    }

    if (egresosRechazados.length > 0) {
        mensajeFinal += organizarMovimientos('Egresos Rechazados', egresosRechazados);
    }

    if (movimientosEnProceso.length > 0) {
        let mensajeProceso = `🕓 Este pedido aún no fue *Conformado*.\n`;
        mensajeProceso += `🔍 A continuación se detallan los materiales en proceso y de dónde se obtendrán:\n\n`;
        mensajeProceso += organizarMovimientos('Materiales en Proceso', movimientosEnProceso);

        mensajeFinal += `\n${mensajeProceso}`;
    }

    await sock.sendMessage(userId, { text: mensajeFinal });
    FlowManager.resetFlow(userId);


    /*
    const { Nro_Pedido } = data.data;

    // Obtenemos los detalles del pedido
    const pedido = await ObtenerConsultaPedido(Nro_Pedido);

    if (!pedido) {
        await sock.sendMessage(userId, { text: '❌ No se pudo encontrar el pedido.' });
        FlowManager.resetFlow(userId);
        return;
    }

    // Formateamos la fecha
    const fechaFormateada = new Date(pedido.Fecha).toISOString().split('T')[0];

    // Construimos el mensaje con los detalles del pedido
    let output = `📋 *Detalles de la Solicitud Cerrada* 📋\n\n`;
    output += `📅 *Fecha:* ${fechaFormateada}\n`;
    output += `🏗️ *Número de retiro:* ${pedido.Nro_Pedido}\n\n`;
    output += `📄 *Estado:* ${pedido.Estado}\n`;
    output += `🏗️ *Aclaración del pedido:* \n${pedido.Aclaracion}\n\n`;

    // Filtramos los egresos y transferencias aprobadas
    const egresosAprobados = pedido.movimientos.filter(m =>
        (m.tipo === 'Egreso' || m.tipo === 'Transferencia') && m.estado === 'Aprobado'
    );
    const egresosRechazados = pedido.movimientos.filter(m => m.estado === 'Rechazado'); // Incluye egresos y transferencias

    // Función auxiliar para organizar movimientos
    const organizarMovimientos = (tipo, movimientos) => {
        let output = `📄 *${tipo}*\n`;
        movimientos.forEach(mov => {
            output += `   🔹 ${mov.producto_name}\n   📦 *Cantidad:* ${mov.cantidad}\n`;
            if (mov.tipo === 'Transferencia' || mov.obra_origen) {
                output += `   🏗️ *Obra Origen:* ${mov.obra_origen}\n`;
            }
            if (mov.obra_destino) {
                output += `   🎯 *Obra Destino:* ${mov.obra_destino}\n`;
            }
            output += `\n`;
        });
        return output;
    };

    // Agregamos los movimientos organizados
    if (egresosAprobados.length > 0) {
        output += organizarMovimientos('Egresos Aprobados', egresosAprobados);
    }
    if (egresosRechazados.length > 0) {
        output += organizarMovimientos('Egresos Rechazados', egresosRechazados);
    }

    // Enviamos el mensaje con los detalles
    await sock.sendMessage(userId, { text: output });

    // Restablecemos el flujo para la siguiente interacción
    FlowManager.resetFlow(userId);
    */
};

