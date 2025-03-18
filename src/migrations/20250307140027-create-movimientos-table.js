'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('movimientos', {
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
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            id_material: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'materiales', // Referencia a la tabla 'materiales'
                    key: 'id', // Columna clave primaria en la tabla materiales
                },
            },
            cod_obra_origen: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'obras', // Referencia a la tabla 'obras'
                    key: 'id', // Columna clave primaria en la tabla obras
                },
            },
            cantidad: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            tipo: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            nro_compra: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            nro_pedido: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            cod_obradestino: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'obras', // Referencia a la tabla 'obras'
                    key: 'id', // Columna clave primaria en la tabla obras
                },
            },
            estado: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "En Proceso",
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('movimientos');
    },
};
