const fs = require('fs');

const path = require('path');

const filePath = path.join(__dirname, '../../BDServices/Movimientos.json');
module.exports =  async function calcularStock(sku, obraId) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);

        let stockDisponible = 0;

        if (Array.isArray(jsonData.Movimiento)) {
            jsonData.Movimiento.forEach(mov => {
                if (mov.SKU === sku && mov.Cod_obraO === obraId) {
                    stockDisponible += mov.tipo ? mov.cantidad : -mov.cantidad;
                }
            });
        }
        return stockDisponible;
    } catch (err) {
        console.error(`Error al calcular stock para SKU ${sku} en obra ${obraId}:`, err);
        return 0;
    }
}

