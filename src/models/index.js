'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const db = {};

// Inicializa Sequelize
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Cargar modelos dinámicamente
fs.readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model; // Agrega el modelo al objeto db
    });

// Definir asociaciones después de cargar todos los modelos
db.Material.hasMany(db.Movimiento, { foreignKey: 'id_material', as: 'movimientos' });
db.Movimiento.belongsTo(db.Material, { foreignKey: 'id_material', as: 'material' });

db.Obra.hasMany(db.Movimiento, { foreignKey: 'cod_obra_origen', as: 'movimientosOrigen' });
db.Obra.hasMany(db.Movimiento, { foreignKey: 'cod_obradestino', as: 'movimientosDestino' });

db.Movimiento.belongsTo(db.Obra, { foreignKey: 'cod_obra_origen', as: 'obraOrigen' });
db.Movimiento.belongsTo(db.Obra, { foreignKey: 'cod_obradestino', as: 'obraDestino' });

db.Pedido.hasMany(db.Movimiento, { foreignKey: 'nro_pedido', as: 'movimientos' });
db.Movimiento.belongsTo(db.Pedido, { foreignKey: 'nro_pedido', as: 'pedido' });

// Exportar objetos
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
