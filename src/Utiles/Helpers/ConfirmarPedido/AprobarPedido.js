const { Pedido, Movimiento } = require('../../../models');
const FlowManager = require('../../../FlowControl/FlowManager');
const { editMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { editPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');
require('dotenv').config();
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
            await editMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }


        const fechita = obtenerFecha()
        // Actualizamos el estado del pedido
        await Pedido.update(
            { estado: 'Aprobado', fecha: fechita },
            {
                where: { id: Nro_Pedido },
            }
        );

        // Obtener el pedido actualizado
        const pedidoActualizado = await Pedido.findOne({ where: { id: Nro_Pedido } });

        // Enviar actualización del pedido a Google Sheets
        await editPedidoToSheetWithClientGeneral(pedidoActualizado.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });

        return { Success: true, msg: '✅ El pedido ha sido aprobado correctamente.' };
    } catch (error) {
        console.error('❌ Error al aprobar el pedido:', error.message);
        return { Success: false, msg: `❌ Error al aprobar el pedido: ${error.message}` };
    }
}
module.exports = AprobarPedido;

const obtenerFecha = () => {
    return new Date(); // Devuelve la fecha como objeto Date
};
