const FlowManager = require('../../../FlowControl/FlowManager');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const calcularStock = require('../EgresoMateriales/CalcularStock');
const { obtenerSiguienteNroPedido } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteNroPedido');
const { Pedido, Movimiento, sequelize } = require('../../../models');
const generarPDFConformidad = require('../../Helpers/EgresoMateriales/ImprimirConformidad');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { addPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');
const { GuardarArchivoFire } = require('../../Chatgpt/storageHandler')
require('dotenv').config();
module.exports = async function realizarMovimientoRetiro(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return false;
    }

    const { obra_id, items } = pedidoAntiguo.data;
    const fecha = obtenerFecha();

    let productosFaltantes = [];

    // **Verificamos el stock**
    const stockVerificado = await Promise.all(items.map(async (item) => {
        let cantidadRestante = item.cantidad;
        let fuentesStock = [{ obra_id: obra_id }];

        if (cantidadRestante > 0) {
            const obrasConStock = await obtenerObrasConStock(item.producto_id);
            fuentesStock.push(...obrasConStock.map(o => ({ obra_id: o.obra_id })));
        }

        for (const fuente of fuentesStock) {
            if (cantidadRestante <= 0) break;

            const stockDisponible = await calcularStock(item.producto_id, fuente.obra_id);
            if (stockDisponible > 0) {
                cantidadRestante -= Math.min(cantidadRestante, stockDisponible);
            }
        }

        if (cantidadRestante > 0) {
            productosFaltantes.push({ producto_name: item.producto_name, cantidad: cantidadRestante });
            return false;
        }

        return true;
    }));

    if (stockVerificado.includes(false)) {
        const productosFaltantesMsg = productosFaltantes.map(item => `${item.producto_name}: Faltan ${item.cantidad}`).join("\n");
        console.error(`❌ Stock insuficiente:\n${productosFaltantesMsg}`);
        return { Success: false, msg: `❌ Stock insuficiente para los siguientes productos:\n${productosFaltantesMsg}` };
    }

    // **Iniciamos la transacción**
    const transaction = await sequelize.transaction();

    try {
        // **Creamos el pedido**
        const nuevoPedido = await Pedido.create({
            fecha,
            aclaracion: "",
            estado: "En Proceso",
            url_remito: null // Se actualizará después
        }, { transaction });

        const UltimoNroPedido = nuevoPedido.id; //await obtenerSiguienteNroPedido();

        // **Creamos los movimientos**
        let movimientosParaCrear = [];

        for (const item of items) {
            let cantidadRestante = item.cantidad;
            let fuentesStock = [{ obra_id: obra_id }];

            if (cantidadRestante > 0) {
                const obrasConStock = await obtenerObrasConStock(item.producto_id);
                fuentesStock.push(...obrasConStock.map(o => ({ obra_id: o.obra_id })));
            }

            for (const fuente of fuentesStock) {
                const obraIdFuente = fuente.obra_id;
                if (cantidadRestante <= 0) break;

                const stockDisponible = await calcularStock(item.producto_id, obraIdFuente);

                if (stockDisponible > 0) {
                    const cantidadATransferir = Math.min(cantidadRestante, stockDisponible);
                    cantidadRestante -= cantidadATransferir;

                    const Cod_ObraDestino = obraIdFuente !== obra_id ? obra_id : null;

                    movimientosParaCrear.push({
                        fecha,
                        nombre: item.producto_name,
                        id_material: item.producto_id,
                        cod_obra_origen: obraIdFuente,
                        cantidad: cantidadATransferir,
                        tipo: false,
                        nro_pedido: UltimoNroPedido.toString(),
                        cod_obradestino: Cod_ObraDestino
                    });
                }
            }
        }

        // **Creamos todos los movimientos en batch**
        const movimientosCreados = await Movimiento.bulkCreate(movimientosParaCrear, { transaction });

        // **Generar y subir el PDF solo si todo salió bien**
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
        // Solo se hace rollback si hubo un error antes del commit.
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
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // getMonth() es base 0
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Devuelve la fecha como cadena en formato YYYY-MM-DD
};
