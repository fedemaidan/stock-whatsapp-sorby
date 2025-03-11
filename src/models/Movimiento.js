'use strict';
const { Model, DataTypes } = require('sequelize'); // Asegura que Model está importado

module.exports = (sequelize, DataTypes) => {
    class Movimiento extends Model { }

    Movimiento.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        id_material: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cod_obra_origen: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        nro_compra: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        nro_pedido: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        cod_obradestino: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        estado: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'En Proceso',
        },
    }, {
        sequelize,
        modelName: 'Movimiento',
        tableName: 'movimientos',
        timestamps: false,
    });

    return Movimiento;
};
