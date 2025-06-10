const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
//const { Sequelize } = require('sequelize');
//const initMovimientoModel = require('./models/movimiento'); // Ajustá el path si es necesario
const { Movimiento } = require('../../models');
const { Obra } = require('../../models');
/*
const sequelize = new Sequelize('MGDB', 'sorby_development', 'sorby_development', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5440, // o tu puerto real
  logging: false,
});
*/

// const Movimiento = initMovimientoModel(sequelize, Sequelize);

(async () => {
  try {
  //  await sequelize.authenticate();
    console.log('Conexión establecida.');

    let contador = 0;

    fs.createReadStream('./Stock.csv')
      .pipe(csv())
      .on('data', async (row) => {
        try {
          const id = parseInt(row['movimiento.id'], 10);
          const id_material = parseInt(row['material id'], 10);
          const cod_obra_origen = parseInt(row['obraOrigen.id'], 10);
          const cod_obradestino = row['obraDestino.id'] !== 'No Aplica' ? parseInt(row['obraDestino.id'], 10) : null;
          const cantidad = parseFloat(row['movimiento.cantidad']);
          const tipo = row['tipoMovimiento'].toLowerCase() === 'ingreso';
          const nro_compra = row['nro_compra'] ? parseInt(row['nro_compra'], 10) : null;
          const nro_pedido = row['NroPedido'] ? parseInt(row['NroPedido'], 10) : null;
          const fecha = new Date(row['fechaSolo']);

          await Movimiento.create({
            id,
            fecha,
            nombre: row['material.nombre'],
            id_material,
            cod_obra_origen,
            cod_obradestino,
            cantidad,
            tipo,
            nro_compra,
            nro_pedido,
            estado: row['estado'] || 'En Proceso'
          });

          contador++;
          console.log(`✔️ Movimiento ID ${id} insertado`);

        } catch (e) {
          console.error(`❌ Error en fila:`, e.message);
        }
      })
      .on('end', () => {
        console.log(`✅ Importación completada. Movimientos cargados: ${contador}`);
    //    sequelize.close();
      });

  } catch (err) {
    console.error('❌ Error al conectar o importar:', err);
  }
})();