const { Movimiento, Material } = require('../../../models');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const moment = require('moment-timezone');

module.exports = async function EfectuarDevolucion(userId, movimientos, sock) {
    try {
        if (!Array.isArray(movimientos) || movimientos.length === 0) {
            throw new Error("No hay movimientos de devolución para procesar.");
        }

        const fecha = moment().toDate();
        const movimientosListos = [];

        for (const item of movimientos) {
            const material = await Material.findOne({ where: { id: item.id_material } });

            if (!material) {
                console.warn(`⚠️ Material con ID ${item.id_material} no encontrado.`);
                continue;
            }

            movimientosListos.push({
                fecha,
                nombre: material.nombre,
                id_material: material.id,
                cod_obra_origen: item.cod_obra_origen,
                cantidad: item.cantidad,
                tipo: true, // ingreso
                nro_pedido: item.nro_pedido || null,
                estado: "Devolucion"
            });
        }

        const movimientosCreados = await Movimiento.bulkCreate(movimientosListos);

        for (const movimiento of movimientosCreados) {
            await addMovimientoToSheetWithClientGeneral(movimiento.dataValues, {
                sheetWithClient: process.env.GOOGLE_SHEET_ID
            });
        }

        await sock.sendMessage(userId, {
            text: `✅ Devolución registrada exitosamente con ${movimientosCreados.length} movimientos.`
        });

        return { Success: true, cantidad: movimientosCreados.length };
    } catch (error) {
        console.error("❌ Error al efectuar la devolución:", error);
        await sock.sendMessage(userId, {
            text: "❌ Ocurrió un error al registrar la devolución. Intentá más tarde."
        });
        return { Success: false, msg: error.message };
    }
};
