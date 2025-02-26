const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../BDServices/Movimientos.json');

const obtenerSiguienteCodigoMovimiento = async () => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        if (!jsonData.Movimiento || jsonData.Movimiento.length === 0) {
            console.log('No hay movimientos en el JSON. Se usará "Cod_movimiento" inicial en 1.');
            return 1;
        }

        const ultimoCodigo = jsonData.Movimiento.reduce((max, mov) =>
            Math.max(max, parseInt(mov.Cod_movimiento, 10) || 0), 0);

        return ultimoCodigo + 1;
    } catch (err) {
        console.error('Error al leer el archivo:', err);
        return 1;
    }
};

module.exports = { obtenerSiguienteCodigoMovimiento };