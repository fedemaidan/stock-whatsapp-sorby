'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('materiales', 'SKU', {
            type: Sequelize.STRING,
            allowNull: true, // Cambiar a false si es requerido
        });

        await queryInterface.addColumn('materiales', 'marca', {
            type: Sequelize.STRING,
            allowNull: true, // Cambiar a false si es requerido
        });

        await queryInterface.addColumn('materiales', 'producto', {
            type: Sequelize.STRING,
            allowNull: true, // Cambiar a false si es requerido
        });

        await queryInterface.addColumn('materiales', 'rubro', {
            type: Sequelize.STRING,
            allowNull: true, // Cambiar a false si es requerido
        });

        await queryInterface.addColumn('materiales', 'zona', {
            type: Sequelize.STRING,
            allowNull: true, // Cambiar a false si es requerido
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('materiales', 'SKU');
        await queryInterface.removeColumn('materiales', 'marca');
        await queryInterface.removeColumn('materiales', 'producto');
        await queryInterface.removeColumn('materiales', 'rubro');
        await queryInterface.removeColumn('materiales', 'zona');
    }
};
