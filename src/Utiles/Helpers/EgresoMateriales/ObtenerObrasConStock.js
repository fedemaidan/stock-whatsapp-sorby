const { Movimiento } = require("../../../models");

async function obtenerObrasConStock(producto_id) {
    try {
        // Obtener todos los movimientos del producto específico
        const movimientos = await Movimiento.findAll({
            attributes: ["cod_obra_origen", "cantidad", "tipo"],
            where: { id_material: producto_id },
        });

        // Calcular el stock por obra
        const stockPorObra = movimientos.reduce((acc, mov) => {
            const obraId = mov.cod_obra_origen;
            const cantidad = mov.tipo ? mov.cantidad : -mov.cantidad; // Suma si es ingreso, resta si es egreso
            acc[obraId] = (acc[obraId] || 0) + cantidad;
            return acc;
        }, {});

        // Convertir a lista de objetos ordenada por stock descendente
        return Object.entries(stockPorObra)
            .map(([obra_id, stock]) => ({ obra_id: parseInt(obra_id), stock }))
            .filter(obra => obra.stock > 0) // Solo obras con stock positivo
            .sort((a, b) => b.stock - a.stock); // Ordenar de mayor a menor stock

    } catch (error) {
        console.error(`Error al obtener obras con stock para SKU ${producto_id}:`, error);
        return [];
    }
}

module.exports = obtenerObrasConStock;
