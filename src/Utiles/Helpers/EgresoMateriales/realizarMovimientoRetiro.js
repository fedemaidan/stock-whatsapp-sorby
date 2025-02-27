const FlowManager = require('../../../FlowControl/FlowManager');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const calcularStock = require('../EgresoMateriales/CalcularStock');
const agregarMovimientos = require('../../../Utiles/BDServices/MovimientosServices');
const { obtenerSiguienteNroPedido } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteNroPedido');
const { obtenerSiguienteCodigoMovimiento } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteCodigoMovimiento');

module.exports = async function realizarMovimientoRetiro(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return false;
    }

    const { Obra_id, Nro_compra, items } = pedidoAntiguo.data;
    let movimientos = [];

    const UltimoNroPedido = await obtenerSiguienteNroPedido();
    let CodMovimiento = await obtenerSiguienteCodigoMovimiento();

    for (const item of items) {
        let cantidadRestante = item.cantidad;
        let fuentesStock = [{ obra_id: Obra_id }, { obra_id: 0 }];

        if (cantidadRestante > 0) {
            const obrasConStock = await obtenerObrasConStock(item.producto_id);
            fuentesStock = [...fuentesStock, ...obrasConStock.map(o => ({ obra_id: o.obra_id }))];
        }

        for (const fuente of fuentesStock) {
            const obraIdFuente = fuente.obra_id;
            if (cantidadRestante <= 0) break;

            const stockDisponible = await calcularStock(item.producto_id, obraIdFuente);
            if (stockDisponible > 0) {
                const cantidadATomar = Math.min(cantidadRestante, stockDisponible);
                cantidadRestante -= cantidadATomar;

                // Movimiento de salida desde la fuente
                movimientos.push({
                    Cod_movimiento: CodMovimiento++,
                    Fecha: obtenerFecha(),
                    SKU: item.producto_id,
                    Descripcion: item.producto_name,
                    Cod_obraO: obraIdFuente,
                    cantidad: cantidadATomar,
                    tipo: false,
                    Nro_compra,
                    Nro_Pedido: UltimoNroPedido.toString(),
                    cod_obraD: Obra_id
                });

                // Movimiento de entrada en la obra solicitante
                movimientos.push({
                    Cod_movimiento: CodMovimiento++,
                    Fecha: obtenerFecha(),
                    SKU: item.producto_id,
                    Descripcion: item.producto_name,
                    Cod_obraO: Obra_id,
                    cantidad: cantidadATomar,
                    tipo: true,
                    Nro_compra,
                    Nro_Pedido: UltimoNroPedido.toString(),
                    cod_obraD: Obra_id
                });
            }
        }

        // Movimiento de salida desde la obra solicitante (consumo final)
        movimientos.push({
            Cod_movimiento: CodMovimiento++,
            Fecha: obtenerFecha(),
            SKU: item.producto_id,
            Descripcion: item.producto_name,
            Cod_obraO: Obra_id,
            cantidad: item.cantidad,
            tipo: false,
            Nro_compra,
            Nro_Pedido: UltimoNroPedido.toString(),
            cod_obraD: null // No hay destino, es egreso final
        });

        if (cantidadRestante > 0) {
            console.error(`Stock insuficiente para SKU: ${item.producto_id} (Falta: ${cantidadRestante})`);
            return false;
        }
    }
    console.log('Movimientos generados:', movimientos);
    return await agregarMovimientos(movimientos);
};

const obtenerFecha = () => {
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Meses en JS van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
};