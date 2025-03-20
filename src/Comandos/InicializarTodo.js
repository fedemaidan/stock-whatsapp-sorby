const path = require('path');
const importObrasFromCSV = require('../Comandos/Funciones/injectobra');
const importMaterialsFromCSV = require('../Comandos/Funciones/injectmat');
const importMovementsFromCSV = require('../Comandos/Funciones/injectmov');
const { sequelize, Movimiento, Pedido, Obra, Material } = require('../models')


async function InicializarAll(filePath) {

    await sequelize.query('DELETE FROM movimientos');

    await sequelize.query('DELETE FROM obras');

    await sequelize.query('DELETE FROM pedido');

    await sequelize.query('DELETE FROM materiales');


    const obrasFilePath = path.resolve(__dirname, '../../CSV/obras.csv');
    await importObrasFromCSV(obrasFilePath);
    console.log('✅ Obras insertadas correctamente.');

    const materialesFilePath = path.resolve(__dirname, '../../CSV/materiales.csv');
    await importMaterialsFromCSV(materialesFilePath);
    console.log('✅ Materiales insertados correctamente.');

    const movimientosFilePath = path.resolve(__dirname, '../../CSV/movimientos.csv');
    await importMovementsFromCSV(movimientosFilePath);
    console.log('✅ Movimientos insertados correctamente.');

}

InicializarAll();