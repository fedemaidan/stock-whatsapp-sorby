'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Obra extends Model { }

    Obra.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Obra',
        tableName: 'obras',
        timestamps: false,
    });

    return Obra;
};
