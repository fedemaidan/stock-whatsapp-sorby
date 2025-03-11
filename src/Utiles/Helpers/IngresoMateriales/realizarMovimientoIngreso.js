const FlowManager = require('../../../FlowControl/FlowManager');
const { Material,Movimiento } = require('../../../models');  // Importa el modelo Material

module.exports = async function realizarMovimientoIngreso(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return { Success: false, msg: 'No se encontró el flujo de datos' };
    }
    const { obra_id, nro_compra, items } = pedidoAntiguo.data;
    let Preingreso = [];

    for (const item of items) {
        let material = await Material.findOne({ where: { nombre: item.producto_name } });
     
        // Se genera el nuevo movimiento
        const nuevoMovimiento = {
            fecha: obtenerFecha(),
            nombre: material.nombre,
            id_material: material.id,
            cod_obra_origen: obra_id,
            cantidad: item.cantidad,
            tipo: true,
            nro_compra: nro_compra,
            cod_obradestino: obra_id,
            estado: "Finalizado"
        };

        Preingreso.push(nuevoMovimiento);
    }

    console.log('Movimientos generados:', Preingreso);

    await Movimiento.bulkCreate(Preingreso);

    return { Success: true, msg: 'Movimientos ingresados correctamente' };
};

const obtenerFecha = () => new Date();
