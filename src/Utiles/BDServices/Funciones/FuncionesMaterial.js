const {Material} = require('../../../models'); // Ajusta la ruta si es necesario
/**
 * Obtener todos los materiales y devolverlos como JSON
 * @returns {Promise<Object>} JSON con la lista de materiales
 */
async function obtenerTodosLosMateriales() {
    try {
        // Trae todos los materiales con todos los atributos
        const materiales = await Material.findAll({
            attributes: ['id', 'nombre']  // Solo incluye estos dos campos
        });

        return { Materiales: materiales };
    } catch (error) {
        console.error('❌ Error al obtener los materiales:', error);
        throw error;
    }
}

/**
 * Obtener un material por su ID y devolverlo como JSON
 * @param {number} id - ID del material
 * @returns {Promise<Object|null>} Objeto JSON con el material o null si no existe
 */
async function obtenerMaterialPorId(id) {
    try {
        const material = await Material.findByPk(id);

        if (!material) {
            return null;
        }

        return material; // Retorna el objeto completo con todos sus atributos
    } catch (error) {
        console.error('❌ Error al obtener el material por ID:', error);
        throw error;
    }
}

// Exportar funciones
module.exports = {
    obtenerTodosLosMateriales,
    obtenerMaterialPorId,
};
