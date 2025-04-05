const { Movimiento, Obra } = require("../../../models");

async function obtenerObrasConStock(producto_id) {
    try {
        const movimientos = await Movimiento.findAll({
            attributes: ["cod_obra_origen", "cantidad", "tipo"],
            where: { id_material: producto_id },
        });

        const stockPorObra = movimientos.reduce((acc, mov) => {
            const obraId = mov.cod_obra_origen;
            const cantidad = mov.tipo ? mov.cantidad : -mov.cantidad;
            acc[obraId] = (acc[obraId] || 0) + cantidad;
            return acc;
        }, {});

        const obrasIds = Object.keys(stockPorObra).map(id => parseInt(id));
        const obras = await Obra.findAll({
            where: { id: obrasIds },
            attributes: ["id", "nombre"]
        });

        return obrasIds
            .map(id => {
                const stock = stockPorObra[id];
                if (stock <= 0) return null;
                const nombre = obras.find(o => o.id === id)?.nombre || "Obra desconocida";
                return { obra_id: id, stock, obra_name: nombre };
            })
            .filter(Boolean)
            .sort((a, b) => b.stock - a.stock);

    } catch (error) {
        console.error(`Error al obtener obras con stock para SKU ${producto_id}:`, error);
        return [];
    }
}


module.exports = obtenerObrasConStock;
