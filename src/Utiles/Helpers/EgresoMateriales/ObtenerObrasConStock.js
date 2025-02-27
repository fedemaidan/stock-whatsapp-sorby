const fs = require('fs');

const path = require('path');

const filePath = path.join(__dirname, '../../BDServices/Movimientos.json');
async function obtenerObrasConStock(producto_id) {
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const movimientos = JSON.parse(data).Movimiento;

        const stockPorObra = movimientos
            .filter(mov => mov.SKU === producto_id && mov.tipo) // Solo movimientos de entrada (suma)
            .reduce((acc, mov) => {
                acc[mov.Cod_obraO] = (acc[mov.Cod_obraO] || 0) + mov.cantidad;
                return acc;
            }, {});

        return Object.entries(stockPorObra)
            .map(([obra_id, stock]) => ({ obra_id: parseInt(obra_id), stock }))
            .filter(obra => obra.stock > 0)
            .sort((a, b) => b.stock - a.stock);

    } catch (error) {
        console.error(`Error al obtener obras con stock para SKU ${producto_id}:`, error);
        return [];
    }
}

module.exports = obtenerObrasConStock;