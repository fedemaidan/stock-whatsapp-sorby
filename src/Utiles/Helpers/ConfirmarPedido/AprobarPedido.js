const { Pedido, Movimiento } = require('../../../models');
const FlowManager = require('../../../FlowControl/FlowManager');
const { editMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { editPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');

async function AprobarPedido(userId) {
    try {
        // Obtenemos la estructura almacenada en FlowManager
        const flowData = FlowManager.userFlows[userId]?.flowData;
        if (!flowData || !flowData.Nro_Pedido) {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        const { Nro_Pedido } = flowData;

        // Actualizamos los movimientos relacionados al pedido
        await Movimiento.update(
            { estado: 'Aprobado' },
            { where: { nro_pedido: Nro_Pedido } }
        );

        // Obtener los movimientos actualizados
        const movimientosActualizados = await Movimiento.findAll({ where: { nro_pedido: Nro_Pedido } });

        // Enviar actualizaciones a Google Sheets
        for (const movimiento of movimientosActualizados) {
            await editMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });
        }

        // Actualizamos el estado del pedido
        await Pedido.update(
            { estado: 'Aprobado' },
            { where: { id: Nro_Pedido } }
        );

        // Obtener el pedido actualizado
        const pedidoActualizado = await Pedido.findOne({ where: { id: Nro_Pedido } });

        // Enviar actualización del pedido a Google Sheets
        await editPedidoToSheetWithClientGeneral(pedidoActualizado.dataValues, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });

        return { Success: true, msg: '✅ El pedido ha sido aprobado correctamente.' };
    } catch (error) {
        console.error('❌ Error al aprobar el pedido:', error.message);
        return { Success: false, msg: `❌ Error al aprobar el pedido: ${error.message}` };
    }
}
module.exports = AprobarPedido;
/*

const { Pedido, Movimiento } = require('../../../models');
const FlowManager = require('../../../FlowControl/FlowManager');

async function AprobarPedido(userId) {
    try {
        // Obtenemos la estructura almacenada en FlowManager
        const flowData = FlowManager.userFlows[userId]?.flowData;


        if(!flowData || !flowData.Nro_Pedido)
        {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        const { Nro_Pedido } = flowData;


        // Actualizamos los movimientos relacionados al pedido
        await Movimiento.update(
            { estado: 'Aprobado' }, // Nuevo estado de los movimientos
            { where: { nro_pedido: Nro_Pedido } } // Se usa nro_pedido en vez de id
        );

        // Actualizamos el estado del pedido
        await Pedido.update(
            { estado: 'Aprobado' }, // Nuevo estado del pedido
            { where: { id: Nro_Pedido } }
        );

        return { Success: true, msg: '✅ El pedido ha sido aprobado correctamente.' };
    } catch (error) {
        console.error('Error al aprobar el pedido:', error.message);
        return { Success: false, msg: `❌ Error al aprobar el pedido: ${error.message}` };
    }
}

module.exports = AprobarPedido;
*/