const FlowManager = require('../../../FlowControl/FlowManager');
const { Material,Movimiento } = require('../../../models');  // Importa el modelo Material
const { addMovimientoToSheetWithClientGeneral } = require('../../GoogleServices/Sheets/movimiento');
const EnviarMensaje = require('../../../Utiles/EnviarMensaje')
require('dotenv').config();

module.exports = async function realizarMovimientoIngreso(userId) {
    const pedidoAntiguo = FlowManager.userFlows[userId]?.flowData;

    if (!pedidoAntiguo) {
        console.error('No se encontró un flujo de datos para el usuario:', userId);
        return { Success: false, msg: 'No se encontró el flujo de datos' };
    }
    const { obra_id, nro_compra, items } = pedidoAntiguo.data;
    let Preingreso = [];


    for (const item of items) {

        //CAMBIAR Y BUSCAR POR ID
        let material = await Material.findOne({ where: { id: item.producto_id } });
     
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


    const movimientosCreados = await Movimiento.bulkCreate(Preingreso);

    //aqui logica para llamar al googlesheet//
    //'1Nd4_14gz03AXg8dJUY6KaZEynhoc5Eaq-EAVqcLh3ek'
    const movimientosConIds = movimientosCreados.map(movimiento => ({
        ...movimiento.dataValues,  // Esto contiene los datos, incluidos los IDs generados
    }));

    for (const movimiento of movimientosConIds) {
        console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID);
        await addMovimientoToSheetWithClientGeneral(movimiento, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
    }
    //---------------------------------------//
    return { Success: true, msg: 'Movimientos ingresados correctamente' };
};

const obtenerFecha = () => {
    return new Date(); // Devuelve la fecha como objeto Date
};

