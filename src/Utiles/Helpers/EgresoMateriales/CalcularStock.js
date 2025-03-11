const { Movimiento } = require("../../../models");

module.exports = async function calcularStock(sku, obraId) {
    try {
        // Obtener todos los movimientos del material en la obra específica
        const movimientos = await Movimiento.findAll({
            attributes: ["cantidad", "tipo"],
            where: {
                id_material: sku,
                cod_obra_origen: obraId
            }
        });

        // Calcular el stock sumando entradas y restando salidas
        const stockDisponible = movimientos.reduce((total, mov) => {
            return total + (mov.tipo ? mov.cantidad : -mov.cantidad);
        }, 0);

        return stockDisponible;
    } catch (err) {
        console.error(`Error al calcular stock para SKU ${sku} en obra ${obraId}:`, err);
        return 0;
    }
};
