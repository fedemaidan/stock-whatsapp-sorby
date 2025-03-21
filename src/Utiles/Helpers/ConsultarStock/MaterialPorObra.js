const { Movimiento, Material, Obra } = require("../../../models");

module.exports = async function MaterialPorObra(id_material) {
    try {
        // Obtener el nombre del material
        const material = await Material.findOne({
            attributes: ["nombre"],
            where: { id: id_material }
        });

        if (!material) {
            throw new Error(`Material con id ${id_material} no encontrado`);
        }

        // Obtener todas las obras
        const obras = await Obra.findAll({
            attributes: ["id", "nombre"]
        });

        let totalStock = 0;
        let stockPorObra = [];

        for (const obra of obras) {
            // Obtener los movimientos del material en la obra específica
            const movimientos = await Movimiento.findAll({
                attributes: ["cantidad", "tipo"],
                where: {
                    id_material,
                    cod_obra_origen: obra.id
                }
            });

            // Calcular el stock sumando entradas y restando salidas
            const stockDisponible = movimientos.reduce((total, mov) => {
                return total + (mov.tipo ? mov.cantidad : -mov.cantidad);
            }, 0);

            totalStock += stockDisponible;
            stockPorObra.push({
                nombre: obra.nombre,
                id: obra.id,
                cantidad: stockDisponible
            });
        }

        return {
            id_material,
            nombre_material: material.nombre,
            total: totalStock,
            obras: stockPorObra
        };
    } catch (err) {
        console.error(`Error al calcular stock para id_material ${id_material}:`, err);
        return null;
    }
};