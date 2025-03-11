'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    class Material extends Model { }

    Material.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        SKU: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        marca: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        producto: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        rubro: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        zona: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Material',
        tableName: 'materiales',
        timestamps: false,
    });

    return Material;
};
