const FlowManager = require('../../../FlowControl/FlowManager');
const { Movimiento, sequelize } = require('../../../models');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const calcularStock = require('../../Helpers/EgresoMateriales/CalcularStock');
require('dotenv').config();

module.exports = async function TransferirMateriales(userId) {

    const data = FlowManager.userFlows[userId]?.flowData;
    const { obra_id_origen, obra_name_origen, obra_id_destino, obra_name_destino, items } = data.data;
    const fecha = obtenerFecha();

    if (!items || items.length === 0) {
        console.error('❌ No hay materiales para transferir.');
        return { Success: false, msg: '❌ No hay materiales para transferir.' };
    }

    let productosFaltantes = [];

    // Verificar stock antes de iniciar la transacción
    for (const item of items) {
        const stockDisponible = await calcularStock(item.producto_id, obra_id_origen);
        if (stockDisponible < item.cantidad) {
            productosFaltantes.push({ producto_name: item.producto_name, cantidad: item.cantidad - stockDisponible });
        }
    }

    if (productosFaltantes.length > 0) {
        const productosFaltantesMsg = productosFaltantes.map(item => `${item.producto_name}: Faltan ${item.cantidad}`).join("\n");
        console.error(`❌ Stock insuficiente:\n${productosFaltantesMsg}`);
        return { Success: false, msg: `❌ Stock insuficiente para los siguientes productos:\n${productosFaltantesMsg}` };
    }

    const transaction = await sequelize.transaction();
    try {
        let movimientosParaCrear = [];

        for (const item of items) {
            const { producto_id, producto_name, cantidad } = item;

            // Registro de egreso
            movimientosParaCrear.push({
                fecha,
                nombre: producto_name,
                id_material: producto_id,
                cod_obra_origen: obra_id_origen,
                cantidad: cantidad, // Egreso
                tipo: false,
                cod_obradestino: obra_id_destino,
                estado: "Traspaso"
            });

            // Registro de ingreso
            movimientosParaCrear.push({
                fecha,
                nombre: producto_name,
                id_material: producto_id,
                cod_obra_origen: obra_id_destino,
                cantidad: cantidad, // Ingreso
                tipo: true,
                cod_obradestino: null,
                estado:"Traspaso"
            });
        }

        // Insertar movimientos en la base de datos
        const movimientosCreados = await Movimiento.bulkCreate(movimientosParaCrear, { transaction });

        // Confirmar la transacción
        await transaction.commit();
        console.log('✅ Transferencia de materiales registrada con éxito');

        // Enviar datos a Google Sheets
        for (const movimiento of movimientosCreados) {
            console.log("📤 Enviando movimiento:", movimiento.dataValues);
            await addMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }

        return { Success: true, msg: '✅ Transferencia de materiales realizada con éxito' };
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error en la transferencia:', error.message);
        return { Success: false, msg: `❌ Error en la transferencia: ${error.message}` };
    }
};

const obtenerFecha = () => {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};