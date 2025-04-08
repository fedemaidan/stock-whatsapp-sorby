const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Movimiento, Material, Obra } = require('../../models'); // Ajusta la ruta si es necesario
//require('dotenv').config({ path: '../../.env' }); // Sube dos niveles desde 'src/Comandos'
require('dotenv').config();
const { addMovimientoToSheetWithClientGeneral } = require('../../Utiles/GoogleServices/Sheets/movimiento'); 

async function importMovementsFromCSV(filePath) {



    console.log(filePath)
    let movimientosCreados;
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
                    const General = await Obra.findOne({ where: { nombre: "FlyDac" } })

                    let CentroDeCostosId = General.id
                    let obraDestinoId = General.id


                    const movimientosPromises = movimientos.map(async (row) => {
                        const material = await Material.findOne({ where: { SKU: row.Codigo } });
                        if (!material) return null;

                        let CentroDeCostos = await Obra.findOne({ where: { nombre: row["Centro de Costos"] } });
                        if (CentroDeCostos) CentroDeCostosId = CentroDeCostos.id;

                        let obraDestino = await Obra.findOne({ where: { nombre: row["Obra Receptora"] } });
                        if (obraDestino) obraDestinoId = obraDestino.id;

                        const baseMovimiento = {
                            fecha: row.Fecha,
                            nombre: row.Descripcion,
                            id_material: material.id,
                            cantidad: row.Cantidad,
                            nro_compra: row.Marca,
                            nro_pedido: row.Producto,
                            estado: "importado"
                        };

                        if (row.Tipo === 'Transferencia') {
                            return [
                                { ...baseMovimiento, cod_obra_origen: CentroDeCostosId, tipo: false },
                                { ...baseMovimiento, cod_obra_origen: General.id, cod_obradestino: obraDestinoId, tipo: true }
                            ];
                        } else if (row.Tipo === 'Egreso') {
                            return { ...baseMovimiento, cod_obra_origen: CentroDeCostos.id, tipo: false };
                        } else if (row.Tipo === 'Ingreso') {
                            return { ...baseMovimiento, cod_obra_origen: CentroDeCostos.id, tipo: true };
                        } else {
                            console.warn(`⚠️ Tipo de movimiento desconocido: ${row.Tipo}. Omitiendo fila.`);
                            return null;
                        }
                    });

                    const resolvedMovimientos = (await Promise.all(movimientosPromises)).flat().filter(Boolean);

                    if (resolvedMovimientos.length > 0)
                    {
                        // Guardar movimientos en la base de datos
                        movimientosCreados = await Movimiento.bulkCreate(resolvedMovimientos);
                        console.log('✅ Movimientos importados correctamente');
                    }

                  
                    // Enviar cada movimiento a Google Sheets
                    if (await subirMovimientosAGoogleSheets(movimientosCreados))
                    {
                        console.log('📊 Movimientos subidos a Google Sheets correctamente');
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


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function subirMovimientosAGoogleSheets(movimientos) {
    for (const [index, movimiento] of movimientos.entries()) {
        console.log(`📤 Subiendo movimiento ${index + 1}...`);

        try {
            await addMovimientoToSheetWithClientGeneral(movimiento, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
        } catch (error) {
            console.error(`❌ Error al subir movimiento ${index + 1}:`, error);
        }

        // Pausa de 1 segundo entre cada solicitud
        await delay(3000);
    }
    console.log('📊 Todos los movimientos han sido subidos con pausas.');
}