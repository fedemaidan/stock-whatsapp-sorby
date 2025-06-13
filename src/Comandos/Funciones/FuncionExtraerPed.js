const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { Pedido } = require('../../models'); // Asegurate que el modelo esté correctamente exportado

(async () => {
  try {
    console.log('Conexión establecida.');

    const pedidosProcesados = new Set();

    fs.createReadStream('./pedidos.csv') // Asegurate de que el archivo exista en esta ruta
      .pipe(csv())
      .on('data', async (row) => {
        try {
          const id = parseInt(row['id'], 10);
          if (!id || pedidosProcesados.has(id)) return;

          pedidosProcesados.add(id);

          const fechaTexto = row['fecha']?.trim();
          const fecha = isNaN(Date.parse(fechaTexto)) ? null : new Date(fechaTexto);

          if (!fecha) {
            console.warn(`⚠️ Fecha inválida en pedido ID ${id}: "${row['fecha']}"`);
          }

          const existente = await Pedido.findByPk(id);
          if (!existente) {
            await Pedido.create({
              id,
              fecha,
              aclaracion: row['aclaracion'] || null,
              estado: row['estado'] || 'En Proceso',
              url_remito: row['url_remito'] || null,
            });
            console.log(`✔️ Insertado pedido ID ${id}`);
          } else {
            console.log(`ℹ️ Ya existe pedido ID ${id}`);
          }
        } catch (innerErr) {
          console.error(`❌ Error procesando fila:`, row, innerErr);
        }
      })
      .on('end', () => {
        console.log('✅ Importación de pedidos completada.');
      })
      .on('error', (error) => {
        console.error('❌ Error al leer el archivo CSV:', error);
      });

  } catch (err) {
    console.error('❌ Error al conectar o importar:', err);
  }
})();
