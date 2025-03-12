const FlowManager = require('../../../FlowControl/FlowManager');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const calcularStock = require('../EgresoMateriales/CalcularStock');
const { obtenerSiguienteNroPedido } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteNroPedido');
const { Pedido, Movimiento, sequelize } = require('../../../models');
const generarPDFConformidad = require('../../Helpers/EgresoMateriales/ImprimirConformidad');
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const { addPedidoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/pedido');

module.exports = async function realizarMovimientoRetiro(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return false;
    }

    const FiletPath = await generarPDFConformidad(userId);
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
            url_remito: FiletPath
        }, { transaction });

        const UltimoNroPedido = await obtenerSiguienteNroPedido();

        // **Enviamos el pedido a Google Sheets**
        console.log("➡ Enviando PEDIDO a Sheets", nuevoPedido.dataValues);
        await addPedidoToSheetWithClientGeneral(nuevoPedido.dataValues, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });

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

                    // **Agregamos a la lista de movimientos**
                    movimientosParaCrear.push({
                        fecha: obtenerFecha(),
                        nombre: item.producto_name,
                        id_material: item.producto_id,
                        cod_obra_origen: obraIdFuente,
                        cantidad: cantidadATransferir,
                        tipo: false, // Siempre egreso
                        nro_pedido: UltimoNroPedido.toString(),
                        cod_obradestino: Cod_ObraDestino
                    });
                }
            }
        }

        // **Creamos todos los movimientos en batch**
        const movimientosCreados = await Movimiento.bulkCreate(movimientosParaCrear, { transaction });

        // **Confirmamos la transacción**
        await transaction.commit();
        console.log('✅ Movimientos y pedido generados con éxito');

        // **Preparar y enviar los datos a Google Sheets**
        const movimientosConIds = movimientosCreados.map(movimiento => movimiento.dataValues);

        console.log("➡ Enviando MOVIMIENTOS a Sheets");
        for (const movimiento of movimientosConIds) {
            console.log("📤 Enviando movimiento:", movimiento.dataValues);
            await addMovimientoToSheetWithClientGeneral(movimiento, { sheetWithClient: '1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek' });
        }

        return { Success: true };
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error al realizar el movimiento:', error.message);
        return { Success: false, msg: `❌ Error al realizar el movimiento: ${error.message}` };
    }
    //version 1
    /*
    const FlowManager = require('../../../FlowControl/FlowManager');
    const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
    const calcularStock = require('../EgresoMateriales/CalcularStock');
    const { obtenerSiguienteNroPedido } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteNroPedido');
    const { Pedido, Movimiento, sequelize } = require('../../../models'); // Agregamos sequelize para transacciones
    const generarPDFConformidad = require('../../Helpers/EgresoMateriales/ImprimirConformidad');

    module.exports = async function realizarMovimientoRetiro(userId) {
        const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

        if (!pedidoAntiguo) {
            console.error('No se encontró un flujo de datos para el usuario:', userId);
            return false;
        }

        const FiletPath = await generarPDFConformidad(userId);
        const { obra_id, items } = pedidoAntiguo.data;
        const fecha = obtenerFecha();

        let productosFaltantes = [];

        // **Primero verificamos el stock de todos los productos**
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
                console.log(`🔍 Verificando stock para SKU: ${item.producto_id} en obra ${fuente.obra_id} - Disponible: ${stockDisponible}`);

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

        // **Si hay productos sin stock, cancelamos la operación**
        if (stockVerificado.includes(false)) {
            const productosFaltantesMsg = productosFaltantes.map(item => `${item.producto_name}: Faltan ${item.cantidad}`).join("\n");
            console.error(`❌ Stock insuficiente:\n${productosFaltantesMsg}`);
            return { Success: false, msg: `❌ Stock insuficiente para los siguientes productos:\n${productosFaltantesMsg}` };
        }

        // **Comenzamos la transacción**
        const transaction = await sequelize.transaction();

        try {
            // **Creamos el pedido**
            const nuevoPedido = await Pedido.create({
                fecha,
                aclaracion: "",
                estado: "En Proceso",
                url_remito: FiletPath
            }, { transaction });

            const UltimoNroPedido = await obtenerSiguienteNroPedido();

            // **Creamos los movimientos**
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

                        await Movimiento.create({
                            fecha: obtenerFecha(),
                            nombre: item.producto_name,
                            id_material: item.producto_id,
                            cod_obra_origen: obraIdFuente,
                            cantidad: cantidadATransferir,
                            tipo: false, // Siempre egreso
                            nro_pedido: UltimoNroPedido.toString(),
                            cod_obradestino: Cod_ObraDestino
                        }, { transaction });
                    }
                }
            }

            // **Si todo sale bien, confirmamos la transacción**
            await transaction.commit();
            console.log('✅ Movimientos generados con éxito');
            return { Success: true };
        } catch (error) {
            // **Si algo falla, deshacemos todo**
            await transaction.rollback();
            console.error('❌ Error al realizar el movimiento:', error.message);
            return { Success: false, msg: `❌ Error al realizar el movimiento: ${error.message}` };
        }
    };

    const obtenerFecha = () => new Date();
    */
}
const obtenerFecha = () => new Date();
