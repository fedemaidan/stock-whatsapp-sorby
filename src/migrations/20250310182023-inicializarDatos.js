const path = require('path');
const importObrasFromCSV = require('../injectobra');
const importMaterialsFromCSV = require('../injectmat');
const importMovementsFromCSV = require('../injectmov');


module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            console.log('🔹 Iniciando la inyección de datos...');

            const obrasFilePath = path.resolve(__dirname, '../../CSV/obras.csv');
            await importObrasFromCSV(obrasFilePath);
            console.log('✅ Obras insertadas correctamente.');

            const materialesFilePath = path.resolve(__dirname, '../../CSV/materiales.csv');
            await importMaterialsFromCSV(materialesFilePath);
            console.log('✅ Materiales insertados correctamente.');

            const movimientosFilePath = path.resolve(__dirname, '../../CSV/movimientos.csv');
            await importMovementsFromCSV(movimientosFilePath);
            console.log('✅ Movimientos insertados correctamente.');

            console.log('🚀 Inyección de datos completada con éxito.');
        } catch (error) {
            console.error('❌ Error durante la inyección de datos:', error);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.bulkDelete('movimientos', null, {});
            await queryInterface.bulkDelete('materiales', null, {});
            await queryInterface.bulkDelete('obras', null, {});

            console.log('🔹 Datos eliminados correctamente.');
        } catch (error) {
            console.error('❌ Error al eliminar datos:', error);
            throw error;
        }
    }
};
