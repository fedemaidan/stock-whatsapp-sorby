const { Material } = require('../../../models'); // Ajustá la ruta según tu estructura

/**
 * Crea materiales automáticamente a partir de una lista de productos no detectados.
 * @param {Array} itemsNoDetectados - Lista de objetos con { producto_name }
 * @returns {Object} Resultado de la operación con formato { Success: boolean, msg: string }
 */
const altaMateriales = async (itemsNoDetectados) => {
    try {
        const materialesCreados = [];

        console.log("entro a la funcion")

        for (const item of itemsNoDetectados) {
            const descripcion = item.producto_name?.trim();

            if (!descripcion) continue;

            const nuevoMaterial = await Material.create({
                nombre: descripcion,
                SKU: null,
                marca: null,
                producto: null,
                rubro: null,
                zona: null,
            });

            materialesCreados.push(nuevoMaterial);
            console.log(`✅ Material creado: ${descripcion}`);
        }

        return {
            Success: true,
            msg: `✅ Se crearon ${materialesCreados.length} materiales correctamente.`,
        };
    } catch (error) {
        console.error("❌ Error al crear materiales:", error.message);
        return {
            Success: false,
            msg: '😓 La carga de materiales falló',
        };
    }
};

module.exports = altaMateriales;
