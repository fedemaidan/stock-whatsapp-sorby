const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
//const { Sequelize } = require('sequelize');
//const initMaterialModel = require('./models/material'); // Asegurate de tener bien el path
const { Material } = require('../../models');

/*
const sequelize = new Sequelize('MGDB', 'sorby_development', 'sorby_development', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5440, // o tu puerto real
  logging: false,
});
*/


//const Material = initMaterialModel(sequelize);

(async () => {
  try {
    //await sequelize.authenticate();
    console.log('Conexión establecida.');

    const materialesProcesados = new Set();

    fs.createReadStream("./Stock.csv")
      .pipe(csv())
      .on('data', async (row) => {
        const id = parseInt(row['material id'], 10);
        if (!id || materialesProcesados.has(id)) return;

        materialesProcesados.add(id);

        const skuParts = row['material.SKU']?.split('-') || [];
        const [marca, producto, rubro, zona] = skuParts;

        const existente = await Material.findByPk(id);
        if (!existente) {
          await Material.create({
            id,
            nombre: row['material.nombre'],
            SKU: row['material.SKU'],
            marca: marca || null,
            producto: producto || null,
            rubro: rubro || null,
            zona: zona || null,
          });
          console.log("✔️ Insertado material ID ${id}");
        } else {
          console.log("ℹ️ Ya existe material ID ${id}");
        }
      })
      .on('end', () => {
        console.log('✅ Importación completada.');
        //sequelize.close();
      });

  } catch (err) {
    console.error('❌ Error al conectar o importar:', err);
  }
})();