const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Material } = require('../../models'); // Ajusta la ruta según sea necesario

async function importMaterialsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const materials = [];

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

                materials.push({
                    nombre: row.Descripcion,
                    SKU: row['CODIGO SKU'],
                    marca: row.Marca,
                    producto: row.Producto,
                    rubro: row.Rubro,
                    zona: row.Zona,
                });
            })
            .on('end', async () => {
                try {
                    console.log('📊 Datos procesados:', materials);

                    if (materials.length === 0) {
                        console.warn('⚠️ No se encontraron registros válidos en el CSV.');
                        return resolve();
                    }

                    console.log('🚀 Insertando datos en la base de datos...');
                    await Material.bulkCreate(materials);
                    console.log('✅ Materiales importados correctamente');
                    resolve();
                } catch (error) {
                    console.error('❌ Error al importar materiales:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('❌ Error al leer el archivo CSV:', error);
                reject(error);
            });
    });
}

module.exports = importMaterialsFromCSV;
