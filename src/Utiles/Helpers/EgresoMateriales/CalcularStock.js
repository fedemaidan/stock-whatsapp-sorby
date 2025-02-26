const fs = require('fs');

const path = require('path');

const filePath = path.join(__dirname, '../../BDServices/Movimientos.json');

module.exports = async function calcularStock(sku) {

    console.log("Entro al CALCULAR STOCK")

    let data;
    try {
        data = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.error('Error al leer el archivo:', err);
        return 0; // O se podría lanzar un error
    }

    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (err) {
        console.error('Error al parsear el JSON:', err);
        return 0;
    }

    let stockDisponible = 0;

    if (Array.isArray(jsonData.Movimiento)) {
        console.log("ENTRO AL IF PARA CALCULAR STOCK!!!!!!!");
        console.log(sku);
        jsonData.Movimiento.forEach(movimiento => {
            if (movimiento.SKU === sku) {
                stockDisponible += movimiento.tipo ? movimiento.cantidad : -movimiento.cantidad;
            }
        });
    }
    return stockDisponible;
}