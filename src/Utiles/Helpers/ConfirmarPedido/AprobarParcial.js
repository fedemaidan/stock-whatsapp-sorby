const FlowManager = require('../../../FlowControl/FlowManager');
const { Pedido, Movimiento, Material, Obra, sequelize } = require('../../../models');
const { editMovimientoToSheetWithClientGeneral, addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { editPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');
require('dotenv').config();
module.exports = async function AprobarParcial(userId) {
    const transaction = await sequelize.transaction();

    try {
        const flowData = FlowManager.userFlows[userId]?.flowData;
        console.log("📌 FlowData recibido:", flowData);

        if (!flowData || !flowData.Nro_Pedido) {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        let { Nro_Pedido, aclaracion, aprobados, rechazados } = flowData;
        console.log(`📌 Procesando pedido #${Nro_Pedido}`);

        // **Actualizar Pedido**
        await Pedido.update(
            { estado: 'Aprobado Parcial', aclaracion },
            { where: { id: Nro_Pedido }, transaction }
        );

        const pedidoActualizado = await Pedido.findOne({ where: { id: Nro_Pedido }, transaction });
        await editPedidoToSheetWithClientGeneral(pedidoActualizado.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });

        // **Actualizar Movimientos Aprobados**
        for (const mov of aprobados) {
            console.log(`✅ Aprobando producto: ${mov.producto_name}`);

            const obraOrigen = await Obra.findOne({ where: { nombre: mov.obra_origen }, transaction });
            if (!obraOrigen) {
                return { Success: false, msg: `❌ No se encontró la obra de origen ${mov.obra_origen}` };
            }

            const movimiento = await Movimiento.findOne({
                where: {
                    nro_pedido: Nro_Pedido,
                    nombre: mov.producto_name,
                    cod_obra_origen: obraOrigen.id
                },
                transaction
            });

            if (!movimiento) {
                return { Success: false, msg: `❌ No se encontró el movimiento ${mov.producto_name}` };
            }

            await Movimiento.update(
                { estado: 'Aprobado', cantidad: mov.cantidad },
                { where: { id: movimiento.id }, transaction }
            );

            const movActualizado = await Movimiento.findOne({ where: { id: movimiento.id }, transaction });
            await editMovimientoToSheetWithClientGeneral(movActualizado.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }

        // **Crear Movimientos Rechazados y sus Devoluciones**
        for (const mov of rechazados) {
            console.log(`❌ Rechazando producto: ${mov.producto_name}`);

            const obraOrigen = await Obra.findOne({ where: { nombre: mov.obra_origen }, transaction });
            if (!obraOrigen) {
                return { Success: false, msg: `❌ No se encontró la obra de origen ${mov.obra_origen}` };
            }

            const movimiento = await Movimiento.findOne({
                where: {
                    nro_pedido: Nro_Pedido,
                    nombre: mov.producto_name,
                    cod_obra_origen: obraOrigen.id
                },
                transaction
            });

            if (!movimiento) {
                return { Success: false, msg: `❌ No se encontró el movimiento ${mov.producto_name}` };
            }

            console.log(`🔄 Creando movimiento "Rechazado" para ${mov.producto_name}`);
            const nuevoMov = await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: movimiento.id_material,
                cod_obra_origen: obraOrigen.id,
                cod_obradestino: movimiento.cod_obradestino,
                cantidad: mov.cantidad, 
                tipo: false,
                nro_pedido: Nro_Pedido,
                estado: 'Rechazado'
            }, { transaction });

            await addMovimientoToSheetWithClientGeneral(nuevoMov.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });

            console.log(`🔄 Creando "Devolución por rechazo" para ${mov.producto_name}`);
            const material = await Material.findOne({ where: { nombre: mov.producto_name }, transaction });
            if (!material) {
                return { Success: false, msg: `❌ No se encontró el material ${mov.producto_name}` };
            }

            let obraDestinoId = obraOrigen.id;
            if (mov.obra_destino) {
                const obraDestinoRecord = await Obra.findOne({ where: { nombre: mov.obra_destino }, transaction });
                if (obraDestinoRecord) {
                    obraDestinoId = obraDestinoRecord.id;
                }
            }

            const devolucion = await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: material.id,
                cod_obra_origen: obraOrigen.id,
                //cod_obradestino: obraOrigen.id,
                cantidad: mov.cantidad,  // Movimiento positivo para balancear
                tipo: true,
                nro_pedido: Nro_Pedido,
                estado: 'Devolución por rechazo'
            }, { transaction });

            await addMovimientoToSheetWithClientGeneral(devolucion.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }

        // **Confirmar transacción**
        await transaction.commit();
        return { Success: true, msg: '✅ Pedido aprobado parcialmente y productos rechazados devueltos correctamente.' };

    } catch (error) {
        await transaction.rollback();
        console.error(`❌ Error en AprobarParcial: ${error.message}`);
        return { Success: false, msg: `❌ Error al aprobar parcialmente el pedido: ${error.message}` };
    }
}

const obtenerFecha = () => {
    return new Date(); // Devuelve la fecha como objeto Date
};

