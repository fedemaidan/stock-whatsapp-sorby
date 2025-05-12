const { Movimiento, Material, Obra } = require('../../../models');

async function obtenerStockPorObra(id_obra) {
    try {
        // 🔍 Buscar la obra
        const obra = await Obra.findByPk(id_obra);
        const nombre_obra = obra?.nombre || `ID ${id_obra}`;

        // 📦 Buscar movimientos vinculados a esa obra
        const movimientos = await Movimiento.findAll({
            where: {
                cod_obra_origen: id_obra
            },
            include: [
                { model: Material, as: 'material', attributes: ['id', 'nombre', 'SKU'] }
            ]
        });

        if (!movimientos.length) {
            return { nombre_obra, materiales: [] };
        }

        // 🧮 Calcular stock por material
        const stock = {};

        for (const mov of movimientos) {
            const idMat = mov.id_material;
            const cantidad = parseFloat(mov.cantidad) * (mov.tipo ? 1 : -1);

            if (!stock[idMat]) {
                stock[idMat] = {
                    id_material: idMat,
                    nombre: mov.material?.nombre || 'Desconocido',
                    SKU: mov.material?.SKU || '',
                    cantidad: 0
                };
            }

            stock[idMat].cantidad += cantidad;
        }

        return {
            nombre_obra,
            materiales: Object.values(stock).filter(mat => mat.cantidad !== 0)
        };
    } catch (error) {
        console.error("❌ Error al obtener stock por obra:", error);
        throw error;
    }
}

module.exports = obtenerStockPorObra;
