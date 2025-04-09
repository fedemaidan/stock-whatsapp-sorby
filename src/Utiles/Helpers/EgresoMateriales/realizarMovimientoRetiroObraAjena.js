const FlowManager = require('../../../FlowControl/FlowManager');
const { Pedido, Movimiento, sequelize } = require('../../../models');
const generarPDFConformidad = require('../../Helpers/EgresoMateriales/ImprimirConformidad');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { addPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');
const { GuardarArchivoFire } = require('../../Chatgpt/storageHandler');
const EnviarMensaje = require('../../../Utiles/EnviarMensaje')
require('dotenv').config();

module.exports = async function realizarMovimientoRetiroObraAjena(userId) {
    const flowdata = FlowManager.userFlows[userId]?.flowData;

    if (!flowdata || !flowdata.pedido_final || !flowdata.data) {
        console.error('No se encontró un flujo de datos válido para el usuario:', userId);
        return { Success: false, msg: '❌ No se encontró un flujo de datos válido.' };
    }

    const { obra_id } = flowdata.data; // Esta es la obra destino
    const pedidoFinal = flowdata.pedido_final;
    const fecha = obtenerFecha();

    console.log("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*--*-*-*-*-*-*");
    await console.log("🧾 Pedido final recibido para procesar:");
    for (const producto of pedidoFinal) {
        await console.log(`📦 Producto: ${producto.nombre} (ID: ${producto.id})`);
        for (const obra of producto.obrasSeleccionadas) {
            await console.log(`   🔸 Obra origen: ${obra.nombre} (ID: ${obra.id}) - Stock Requerido: ${obra.stockRequerido}`);
        }
    }
    console.log("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*--*-*-*-*-*-*");

    const transaction = await sequelize.transaction();

    try {
        const nuevoPedido = await Pedido.create({
            fecha,
            aclaracion: "",
            estado: "En Proceso",
            url_remito: null
        }, { transaction });

        const nroPedido = nuevoPedido.id;
        let movimientosParaCrear = [];

        for (const producto of pedidoFinal) {
            const { id: producto_id, nombre: producto_name, obrasSeleccionadas } = producto;

            for (const obra of obrasSeleccionadas) {
                const obraOrigenId = obra.id;
                const cantidad = obra.stockRequerido;

                // 🚫 Si la cantidad es 0 o menor, ignoramos el movimiento
                if (!cantidad || cantidad <= 0) {
                    console.log(`⛔ Movimiento ignorado: ${producto_name} desde obra ${obra.nombre} con cantidad ${cantidad}`);
                    continue;
                }

                let obra_destino = obra_id !== obraOrigenId ? obra_id : null;

                movimientosParaCrear.push({
                    fecha,
                    nombre: producto_name,
                    id_material: producto_id,
                    cod_obra_origen: obraOrigenId,
                    cantidad,
                    tipo: false, // Egreso o Transferencia
                    nro_pedido: nroPedido.toString(),
                    cod_obradestino: obra_destino
                });
            }
        }

        const movimientosCreados = await Movimiento.bulkCreate(movimientosParaCrear, { transaction });

        const filePath = await generarPDFConformidad(userId);
        const result = await GuardarArchivoFire(filePath, userId);

        if (!result.success) throw new Error("No se pudo guardar el archivo en Firebase");

        await Pedido.update(
            { url_remito: result.signedUrl },
            { where: { id: nroPedido }, transaction }
        );

        nuevoPedido.url_remito = result.signedUrl;

        await transaction.commit();
        console.log('✅ Movimientos y pedido generados con éxito');

        console.log("➡ Enviando PEDIDO a Sheets");
        await addPedidoToSheetWithClientGeneral(nuevoPedido.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });

        console.log("➡ Enviando MOVIMIENTOS a Sheets");
        for (const movimiento of movimientosCreados) {
            console.log("📤 Enviando movimiento:", movimiento.dataValues);
            await addMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }

        return { Success: true, FiletPath: filePath, NroPedido: nroPedido };

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
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};



/*
const FlowManager = require('../../../FlowControl/FlowManager');
const { Pedido, Movimiento, sequelize } = require('../../../models');
const generarPDFConformidad = require('../../Helpers/EgresoMateriales/ImprimirConformidad');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { addPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');
const { GuardarArchivoFire } = require('../../Chatgpt/storageHandler');
require('dotenv').config();

module.exports = async function realizarMovimientoRetiroObraAjena(userId) {
    const flowdata = FlowManager.userFlows[userId]?.flowData;

    if (!flowdata || !flowdata.pedido_final || !flowdata.data) {
        console.error('No se encontró un flujo de datos válido para el usuario:', userId);
        return false;
    }

    const { obra_id } = flowdata.data;
    const pedidoFinal = flowdata.pedido_final;
    const fecha = obtenerFecha();

    const transaction = await sequelize.transaction();

    try {
        // Crear el pedido
        const nuevoPedido = await Pedido.create({
            fecha,
            aclaracion: "",
            estado: "En Proceso",
            url_remito: null
        }, { transaction });

        const nroPedido = nuevoPedido.id;
        let movimientosParaCrear = [];

        // Generar movimientos desde el pedido_final
        for (const producto of pedidoFinal) {
            const { id: producto_id, nombre: producto_name, obrasSeleccionadas } = producto;

            for (const obra of obrasSeleccionadas) {
                const { obra_id: obraOrigenId, cantidad } = obra;

                movimientosParaCrear.push({
                    fecha,
                    nombre: producto_name,
                    id_material: producto_id,
                    cod_obra_origen: obraOrigenId,
                    cantidad,
                    tipo: false, // Egreso
                    nro_pedido: nroPedido.toString(),
                    cod_obradestino: obra_id // La obra de destino siempre es la obra principal
                });
            }
        }

        // Crear movimientos
        const movimientosCreados = await Movimiento.bulkCreate(movimientosParaCrear, { transaction });

        // Generar y guardar PDF
        const filePath = await generarPDFConformidad(userId);
        const result = await GuardarArchivoFire(filePath, userId);

        if (!result.success) throw new Error("No se pudo guardar el archivo en Firebase");

        console.log("✅ Se guardó correctamente el egreso en Firebase");

        // Actualizar pedido con URL del PDF
        await Pedido.update(
            { url_remito: result.signedUrl },
            { where: { id: nroPedido }, transaction }
        );

        nuevoPedido.url_remito = result.signedUrl;

        // Confirmar la transacción
        await transaction.commit();
        console.log('✅ Movimientos y pedido generados con éxito');

        // Enviar a Google Sheets
        console.log("➡ Enviando PEDIDO a Sheets");
        await addPedidoToSheetWithClientGeneral(nuevoPedido.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });

        console.log("➡ Enviando MOVIMIENTOS a Sheets");
        for (const movimiento of movimientosCreados) {
            console.log("📤 Enviando movimiento:", movimiento.dataValues);
            await addMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        }

        return { Success: true, FiletPath: filePath, NroPedido: nroPedido };

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
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
};
*/