const FlowManager = require('../../../FlowControl/FlowManager');
const { Pedido, Movimiento, sequelize } = require('../../../models');
const generarPDFConformidad = require('../../Helpers/EgresoMateriales/ImprimirConformidad');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { addPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');
const { GuardarArchivoFire } = require('../../Chatgpt/storageHandler');
require('dotenv').config();

module.exports = async function realizarMovimientoRetiro(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return false;
    }

    const { obra_id, items } = pedidoAntiguo.data;
    const fecha = obtenerFecha();

    // **Iniciamos la transacción**
    const transaction = await sequelize.transaction();

    try {
        // **Creamos el pedido**
        const nuevoPedido = await Pedido.create({
            fecha,
            aclaracion: "",
            estado: "En Proceso",
            url_remito: null
        }, { transaction });

        const UltimoNroPedido = nuevoPedido.id;

        // **Generamos los movimientos sin análisis de stock**
        const movimientosParaCrear = items.map(item => ({
            fecha,
            nombre: item.producto_name,
            id_material: item.producto_id,
            cod_obra_origen: obra_id,
            cantidad: item.cantidad,
            tipo: false,
            nro_pedido: UltimoNroPedido.toString(),
            cod_obradestino: null
        }));

        // **Insertamos los movimientos en la base de datos**
        const movimientosCreados = await Movimiento.bulkCreate(movimientosParaCrear, { transaction });

        // **Generar y subir el PDF**
        const FiletPath = await generarPDFConformidad(userId);
        const result = await GuardarArchivoFire(FiletPath, userId);

        if (!result.success) {
            throw new Error("No se pudo guardar el archivo en Firebase");
        }

        console.log("✅ Se guardó correctamente el egreso en Firebase");

        // **Actualizar el pedido con la URL del PDF**
        await Pedido.update(
            { url_remito: result.signedUrl },
            { where: { id: nuevoPedido.id }, transaction }
        );

        nuevoPedido.url_remito = result.signedUrl;

        // **Confirmamos la transacción**
        await transaction.commit();
        console.log('✅ Movimientos y pedido generados con éxito');

        // **Enviar datos a Google Sheets**
        console.log("➡ Enviando PEDIDO a Sheets");
        await addPedidoToSheetWithClientGeneral(nuevoPedido.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });

        console.log("➡ Enviando MOVIMIENTOS a Sheets");
        for (const movimiento of movimientosCreados) {
            console.log("📤 Enviando movimiento:", movimiento.dataValues);
            await addMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }

        return { Success: true, FiletPath: FiletPath, NroPedido: nuevoPedido.id };

    } catch (error) {
        if (transaction.finished !== 'commit') {
            await transaction.rollback();
        }
        console.error('❌ Error al realizar el movimiento:', error.message);
        return { Success: false, msg: `❌ Error al realizar el movimiento: ${error.message}` };
    }
};

const obtenerFecha = () => {
    const fecha = new Date();
    return fecha.toISOString().split('T')[0]; // Devuelve la fecha en formato YYYY-MM-DD
};