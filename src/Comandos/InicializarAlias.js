const { Material, Movimiento } = require('../models');
const InventarAlias = require('./InventarAlias');

async function calcularStock(materialId) {
    const movimientos = await Movimiento.findAll({ where: { id_material: materialId } });

    let stock = 0;
    for (const m of movimientos) {
        stock += m.tipo ? m.cantidad : -m.cantidad;
    }

    return stock;
}

async function InicializarAlias() {
    try {
        const materiales = await Material.findAll();

        for (const material of materiales) {
            const stock = await calcularStock(material.id);

            if (stock > 0) {
                console.log(`Procesando material ID ${material.id} con stock ${stock}...`);
                await InventarAlias(material);
            } else {
                console.log(`Material ID ${material.id} sin stock, se salta.`);
            }
        }

        console.log('Proceso de alias finalizado.');
    } catch (error) {
        console.error('Error al inicializar alias:', error);
    }
}

module.exports = InicializarAlias;