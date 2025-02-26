const agregarMovimientos = require('../../../Utiles/BDServices/MovimientosServices');
const FlowManager = require('../../../FlowControl/FlowManager');
const { obtenerSiguienteNroPedido } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteNroPedido');
const { obtenerSiguienteCodigoMovimiento } = require('../../../Utiles/BDServices/utiles/obtenerSiguienteCodigoMovimiento');
const calcularStock = require('../../../Utiles/Helpers/EgresoMateriales/CalcularStock');

const obtenerFecha = () => {
    const fecha = new Date();
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
};

module.exports = async function realizarMovimientoRetiro(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    console.log("/*/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/----/-/-/-/-/-/-/--/--");
    console.log("ENTRO A LA FUNCIÓN de retiro!!!!!");
    console.log("/*/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/----/-/-/-/-/-/-/--/--");

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return false;
    }

    const { Obra_id, Nro_compra, items } = pedidoAntiguo.data;
    let movimientos = [];

    const UltimoNroPedido = await obtenerSiguienteNroPedido();
    let CodMovimiento = await obtenerSiguienteCodigoMovimiento();

    // Verificar stock antes de continuar
    for (const item of items) {
        const stockDisponible = await calcularStock(item.producto_id); // Asegurar que la función es asíncrona si accede a BD
        if (stockDisponible < item.cantidad) {
            console.error(`Stock insuficiente para SKU: ${item.producto_id} (Disponible: ${stockDisponible}, Requerido: ${item.cantidad})`);
            return false; // Detiene la ejecución si no hay suficiente stock
        }
    }

    // Generar movimientos si el stock es suficiente
    for (const item of items) {
        movimientos.push({
            "Cod_movimiento": CodMovimiento++,
            "Fecha": obtenerFecha(),
            "descripcion": item.producto_name,
            "SKU": item.producto_id,
            "Cod_obraO": "0",
            "cantidad": item.cantidad,
            "tipo": false,  // false = salida (resta)
            "Nro_compra": Nro_compra,
            "Nro_Pedido": UltimoNroPedido.toString(),
            "cod_obraD": Obra_id
        });
    }

    console.log('Movimientos generados:', movimientos);

    return await agregarMovimientos(movimientos);
};
