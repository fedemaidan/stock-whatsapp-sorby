const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Obra } = require('../../models'); // Ajusta la ruta según sea necesario

async function importObrasFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const obras = [];

        if (!fs.existsSync(filePath)) {
            console.error('❌ El archivo no existe en la ruta proporcionada:', filePath);
            return reject(new Error('Archivo CSV no encontrado'));
        }

        console.log('📂 Leyendo archivo CSV...');

        fs.createReadStream(filePath)
            .pipe(csv({
                separator: ',',
                mapHeaders: ({ header }) => header.trim()
            }))
            .on('data', (row) => {
                console.log('🔍 Fila leída:', row);

                obras.push({
                    nombre: row.Descripcion,
                });
            })
            .on('end', async () => {
                try {
                    console.log('📊 Datos procesados:', obras);

                    if (obras.length === 0) {
                        console.warn('⚠️ No se encontraron registros válidos en el CSV.');
                        return resolve();
                    }

                    console.log('🚀 Insertando datos en la base de datos...');
                    await Obra.bulkCreate(obras);
                    console.log('✅ Obras importadas correctamente');
                    resolve();
                } catch (error) {
                    console.error('❌ Error al importar obras:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('❌ Error al leer el archivo CSV:', error);
                reject(error);
            });
    });
}

module.exports = importObrasFromCSV;
