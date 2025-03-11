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
