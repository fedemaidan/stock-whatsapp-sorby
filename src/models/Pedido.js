'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Pedido = sequelize.define("Pedido", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        aclaracion: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        estado: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: "En Proceso",
        },
        url_remito: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: "pedido",
        timestamps: false,
    });

    return Pedido;
};
