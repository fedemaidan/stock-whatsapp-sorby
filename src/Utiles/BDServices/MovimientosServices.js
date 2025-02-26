const fs = require('fs');
const filePath = './src/Utiles/BDServices/Movimientos.json';

/**
 * @param {function(Error, Object): void} callback - Función callback que recibe (error, datosActualizados).
 */
module.exports = async function agregarMovimientos(movimientosArray) {
    try {
        // Leer el archivo JSON
        const data = await fs.promises.readFile(filePath, 'utf8');
        let jsonData = JSON.parse(data);

        // Asegurar que el campo "Movimiento" es un array
        if (!Array.isArray(jsonData.Movimiento)) {
            jsonData.Movimiento = [];
        }

        // Validar que los movimientos recibidos sean un array
        if (!Array.isArray(movimientosArray) || movimientosArray.length === 0) {
            throw new Error('El parámetro debe ser un array de movimientos válido.');
        }

        // Agregar los nuevos movimientos al array existente
        jsonData.Movimiento.push(...movimientosArray);

        // Guardar el JSON actualizado
        const nuevoContenido = JSON.stringify(jsonData, null, 2);
        await fs.promises.writeFile(filePath, nuevoContenido, 'utf8');

        console.log('Movimientos agregados correctamente.');
        return true;
    } catch (err) {
        console.error('Error al agregar movimientos:', err);
        throw err;
    }
};