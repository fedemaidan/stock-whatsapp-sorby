'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('pedido', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            fecha: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            aclaracion: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            estado: {
                type: Sequelize.TEXT,
                allowNull: true,
                defaultValue: "En Proceso",
            },
            url_remito: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('pedido');
    },
};
