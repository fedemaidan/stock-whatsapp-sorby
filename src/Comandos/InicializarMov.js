const path = require('path');
const importMovementsFromCSV = require('../Comandos/Funciones/injectmov');

async function InicializarMov(filePath) {

    await Movimiento.destroy({
        where: {},
        truncate: true
    })

    const movimientosFilePath = path.resolve(__dirname, '../../CSV/movimientos.csv');
    await importMovementsFromCSV(movimientosFilePath);

    console.log('✅ Movimientos insertados correctamente.');
}

InicializarMov();