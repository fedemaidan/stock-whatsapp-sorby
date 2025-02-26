const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../BDServices/Movimientos.json');

const obtenerSiguienteNroPedido = async () => {
    try {
        const data = await fs.promises.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        if (!jsonData.Movimiento || jsonData.Movimiento.length === 0) {
            console.log('No hay movimientos en el JSON. Se usará "Nro_Pedido" inicial en 1.');
            return 1;
        }

        const ultimoMovimiento = jsonData.Movimiento[jsonData.Movimiento.length - 1];
        const ultimoNroPedido = parseInt(ultimoMovimiento.Nro_Pedido, 10);

        return isNaN(ultimoNroPedido) ? 1 : ultimoNroPedido + 1;
    } catch (err) {
        console.error('Error al leer el archivo:', err);
        return 1;
    }
};

module.exports = { obtenerSiguienteNroPedido };