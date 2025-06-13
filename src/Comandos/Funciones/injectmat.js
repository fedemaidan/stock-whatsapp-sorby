const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Material } = require('../../models');

async function importMaterialsFromCSV() {
    return new Promise((resolve, reject) => {
        const materials = [];
        const logPath = path.join(__dirname, 'log_insertados_materiales.txt');

        fs.writeFileSync(logPath, '', 'utf8');

        console.log('📂 Leyendo archivo CSV...');

        fs.createReadStream('./materiales.csv')
            .pipe(csv({
                separator: ',',
                mapHeaders: ({ header }) => header.trim()
            }))
            .on('data', (row) => {
                if ('id' in row) {
                    console.warn(`⚠️ CSV contiene un campo 'id': ${row.id} (será ignorado)`);
                    delete row.id;
                }

                const nombre = row.Descripcion?.trim();

                if (!nombre) {
                    console.warn('⚠️ Fila ignorada: Descripción vacía o inválida.');
                    return;
                }

                const material = {
                    nombre,
                    SKU: row['CODIGO SKU']?.trim(),
                    marca: row.Marca?.trim(),
                    producto: row.Producto?.trim(),
                    rubro: row.Rubro?.trim(),
                    zona: row.Zona?.trim(),
                };

                materials.push(material);
            })
            .on('end', async () => {
                try {
                    console.log(`📦 Procesando ${materials.length} materiales...`);

                    for (const material of materials) {
                        try {
                            const yaExiste = await Material.findOne({
                                where: { nombre: material.nombre }
                            });

                            if (yaExiste) {
                                console.log(`ℹ️ Ya existe: "${material.nombre}"`);
                                continue;
                            }

                            await Material.create(material);

                            const logMsg = `✔️ Insertado: "${material.nombre}" (SKU: ${material.SKU || 'sin SKU'})\n`;
                            console.log(logMsg.trim());
                            fs.appendFileSync(logPath, logMsg);
                        } catch (innerErr) {
                            console.error(`❌ Error con material "${material.nombre}":`, innerErr.message);
                        }
                    }

                    console.log(`✅ Materiales importados correctamente. Log guardado en ${logPath}`);
                    resolve();
                } catch (error) {
                    console.error('❌ Error general al importar materiales:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('❌ Error al leer el archivo CSV:', error);
                reject(error);
            });
    });
}

importMaterialsFromCSV()
    .then(() => console.log('🏁 Proceso finalizado.'))
    .catch((err) => console.error('🔥 Falló el proceso:', err));