const FlowManager = require('../../../FlowControl/FlowManager');
const { Pedido, Movimiento, Material, Obra, sequelize } = require('../../../models');
const { editMovimientoToSheetWithClientGeneral, addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { editPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');

module.exports = async function RechazarPedido(userId) {
    const transaction = await sequelize.transaction();

    try {
        const flowData = FlowManager.userFlows[userId]?.flowData;



        console.log("📌 FlowData recibido:", flowData);

        if (!flowData || !flowData.Nro_Pedido) {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        let { Nro_Pedido, aclaracion } = flowData;

        const rechazados = flowData.movimientos || [];
        console.log(`📌 Rechazando pedido #${Nro_Pedido}`);

        // **Actualizar Pedido**
        await Pedido.update(
            { estado: 'Rechazado', aclaracion },
            { where: { id: Nro_Pedido }, transaction }
        );

        const pedidoActualizado = await Pedido.findOne({ where: { id: Nro_Pedido }, transaction });
        await editPedidoToSheetWithClientGeneral(pedidoActualizado.dataValues, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });

        // **Actualizar y Registrar Movimientos**
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

            // Actualizar estado del movimiento original
            await Movimiento.update(
                { estado: 'Rechazado' },
                { where: { id: movimiento.id }, transaction }
            );

            const movActualizado = await Movimiento.findOne({ where: { id: movimiento.id }, transaction });
            await editMovimientoToSheetWithClientGeneral(movActualizado.dataValues, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });

            // Registrar devolución
            console.log(`🔄 Creando "Devolución por rechazo" para ${mov.producto_name}`);
            const material = await Material.findOne({ where: { nombre: mov.producto_name }, transaction });
            if (!material) {
                return { Success: false, msg: `❌ No se encontró el material ${mov.producto_name}` };
            }

            const devolucion = await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: material.id,
                cod_obra_origen: obraOrigen.id,
                cod_obradestino: obraOrigen.id, // Se devuelve a la obra de origen
                cantidad: mov.cantidad,
                tipo: true,
                nro_pedido: Nro_Pedido,
                estado: 'Devolución por rechazo'
            }, { transaction });

            await addMovimientoToSheetWithClientGeneral(devolucion.dataValues, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });
        }

        // **Confirmar transacción**
        await transaction.commit();
        return { Success: true, msg: '✅ Pedido rechazado y productos devueltos correctamente.' };

    } catch (error) {
        await transaction.rollback();
        console.error(`❌ Error en RechazarPedido: ${error.message}`);
        return { Success: false, msg: `❌ Error al rechazar el pedido: ${error.message}` };
    }
}

const obtenerFecha = () => new Date();

/*
module.exports = async function RechazarPedido(userId) {
    try {
        // Obtenemos la estructura almacenada en FlowManager
        const flowData = FlowManager.userFlows[userId]?.flowData;
        if (!flowData || !flowData.Nro_Pedido) {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        const { Nro_Pedido, movimientos } = flowData;

        // Actualizamos el estado del pedido a "Rechazado"
        await Pedido.update(
            { estado: 'Rechazado' },
            { where: { id: Nro_Pedido } }
        );

        // Actualizamos el estado de los movimientos a "Rechazado"
        await Movimiento.update(
            { estado: 'Rechazado' },
            { where: { nro_pedido: Nro_Pedido } }
        );

        // Crear movimientos inversos para devolver el stock
        for (const mov of movimientos) {
            // Buscar el id_material por nombre
            const material = await Material.findOne({
                where: { nombre: mov.producto_name }
            });

            if (!material) {
                console.error(`Error: No se encontró el material con nombre ${mov.producto_name}`);
                return { Success: false, msg: `❌ No se encontró el material con nombre ${mov.producto_name}` };
            }

            // Buscar el id de la obra de origen
            const obraOrigen = await Obra.findOne({
                where: { nombre: mov.obra_origen }
            });

            if (!obraOrigen) {
                console.error(`Error: No se encontró la obra de origen con nombre ${mov.obra_origen}`);
                return { Success: false, msg: `❌ No se encontró la obra de origen con nombre ${mov.obra_origen}` };
            }

            // Determinar la obra de destino. Si no existe, el material vuelve a la obra de origen
            let obraDestinoId = null;

            if (mov.obra_destino && mov.obra_destino !== "No definida") {
                const obraDestinoRecord = await Obra.findOne({
                    where: { nombre: mov.obra_destino }
                });

                if (!obraDestinoRecord) {
                    console.error(`Error: No se encontró la obra de destino con nombre ${mov.obra_destino}`);
                    return { Success: false, msg: `❌ No se encontró la obra de destino con nombre ${mov.obra_destino}` };
                }

                obraDestinoId = obraDestinoRecord.id;
            } else {
                // Si obra_destino no está definida, el material regresa a la obra de origen
                obraDestinoId = obraOrigen.id;
            }

            // Crear el movimiento inverso
            await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: material.id,
                cod_obra_origen: obraDestinoId, // Ahora correctamente apunta a la obra origen si no hay destino
                cod_obradestino: obraOrigen.id,
                cantidad: mov.cantidad,
                tipo: true, // Indica que es una devolución
                nro_pedido: Nro_Pedido,
                estado: 'Devolucion por rechazo'
            });
        }

        return { Success: true, msg: '✅ El pedido ha sido rechazado y el stock ha sido restituido correctamente.' };
    } catch (error) {
        console.error('Error al rechazar el pedido:', error.message);
        return { Success: false, msg: `❌ Error al rechazar el pedido: ${error.message}` };
    }
}
*/