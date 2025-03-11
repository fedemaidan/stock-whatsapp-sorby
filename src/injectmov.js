const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Movimiento, Material, Obra } = require('../src/models'); // Ajusta la ruta si es necesario

async function importMovementsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const movimientos = [];

        if (!fs.existsSync(filePath)) {
            console.error('❌ El archivo no existe en la ruta proporcionada:', filePath);
            return reject(new Error('Archivo CSV no encontrado'));
        }

        console.log('📂 Leyendo archivo CSV...');

        fs.createReadStream(filePath)
            .pipe(csv({ separator: ',', mapHeaders: ({ header }) => header.trim() }))
            .on('data', (row) => movimientos.push(row))
            .on('end', async () => {
                try {
                    console.log('📊 Procesando datos...');
                    if (movimientos.length === 0) {
                        console.warn('⚠️ No se encontraron registros válidos en el CSV.');
                        return resolve();
                    }

                    const movimientosPromises = movimientos.map(async (row) => {
                        const material = await Material.findOne({ where: { SKU: row.Codigo } });
                        if (!material) return null;

                        let obraOrigenId = 1;
                        let obraDestinoId = 1;

                        const obraOrigen = await Obra.findOne({ where: { nombre: row["Centro de Costos"] } });
                        if (obraOrigen) obraOrigenId = obraOrigen.id;

                        const obraDestino = await Obra.findOne({ where: { nombre: row["Obra Receptora"] } });
                        if (obraDestino) obraDestinoId = obraDestino.id;

                        const baseMovimiento = {
                            fecha: row.Fecha,
                            nombre: row.Descripcion,
                            id_material: material.id,
                            cantidad: row.Cantidad,
                            nro_compra: row.Marca,
                            nro_Pedido: row.Producto,
                            estado: "importado"
                        };

                        if (row.Tipo === 'Transferencia') {
                            return [
                                { ...baseMovimiento, cod_obra_origen: obraOrigenId, tipo: false },
                                { ...baseMovimiento, cod_obra_origen: 1, cod_obradestino: obraDestinoId, tipo: true }
                            ];
                        } else if (row.Tipo === 'Egreso') {
                            return { ...baseMovimiento, cod_obra_origen: obraOrigenId, tipo: false };
                        } else if (row.Tipo === 'Ingreso') {
                            return { ...baseMovimiento, cod_obra_origen: 1, cod_obradestino: obraOrigenId, tipo: true };
                        } else {
                            console.warn(`⚠️ Tipo de movimiento desconocido: ${row.Tipo}. Omitiendo fila.`);
                            return null;
                        }
                    });

                    const resolvedMovimientos = (await Promise.all(movimientosPromises)).flat().filter(Boolean);
                    if (resolvedMovimientos.length > 0) {
                        await Movimiento.bulkCreate(resolvedMovimientos);
                        console.log('✅ Movimientos importados correctamente');
                    }

                    resolve();
                } catch (error) {
                    console.error('❌ Error al importar movimientos:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('❌ Error al leer el archivo CSV:', error);
                reject(error);
            });
    });
}

module.exports = importMovementsFromCSV;
