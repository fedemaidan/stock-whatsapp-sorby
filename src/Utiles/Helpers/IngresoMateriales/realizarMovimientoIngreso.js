const agregarMovimientos = require('../../../Utiles/BDServices/MovimientosServices');
const FlowManager = require('../../../FlowControl/FlowManager');
const { obtenerSiguienteNroPedido } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteNroPedido');
const { obtenerSiguienteCodigoMovimiento } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteCodigoMovimiento');

// Función para obtener la fecha en formato corto
const obtenerFecha = () => {
    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Meses en JS van de 0 a 11
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

// Función principal para realizar el movimiento de ingreso
module.exports = async function realizarMovimientoIngreso(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return;
    }

    const { Obra_id, Obra_name, Nro_compra, Nro_Pedido, items } = pedidoAntiguo.data;
    let Preingreso = [];  // Array para almacenar los movimientos

    const UltimoNroPedido = await obtenerSiguienteNroPedido(); // Obtener número de pedido correcto
    let CodMovimiento = await obtenerSiguienteCodigoMovimiento(); // Obtener el siguiente código de movimiento

    items.forEach(item => {
        const nuevoMovimiento = {
            "Cod_movimiento": CodMovimiento++,  // Incrementamos el código de movimiento
            "Fecha": obtenerFecha(),
            "descripcion": item.producto_name,
            "SKU": item.producto_id,
            "Cod_obraO": "0",
            "cantidad": item.cantidad,
            "tipo": true,  // true = entrada (suma), false = salida (resta)
            "Nro_compra": Nro_compra,
            "Nro_Pedido": UltimoNroPedido.toString(),
            "cod_obraD": Obra_id
        };
        Preingreso.push(nuevoMovimiento)
    });
    console.log('Movimientos generados:', Preingreso);

    if (await agregarMovimientos(Preingreso)) {
        return true
    } else {
        return false
    }
};

