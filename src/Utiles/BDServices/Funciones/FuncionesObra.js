const { Obra } = require('../../../models');  // Asegúrate de que la ruta sea correcta


/**
 * Obtener todas las obras y devolverlas como JSON
 * @returns {Promise<Object>} JSON con la lista de obras
 */
async function obtenerTodasLasObras() {
    try {
        const obras = await Obra.findAll();

        return { Obras: obras.map(obra => obra.toJSON()) };
    } catch (error) {
        console.error('❌ Error al obtener las obras:', error);
        throw error;
    }
}

/**
 * Obtener una obra por su ID y devolverla como JSON
 * @param {number} id - ID de la obra
 * @returns {Promise<Object|null>} Objeto JSON con la obra o null si no existe
 */
async function obtenerObraPorId(id) {
    try {
        const obra = await Obra.findByPk(id);

        if (!obra) {
            return null;
        }

        return obra.toJSON();
    } catch (error) {
        console.error('❌ Error al obtener la obra por ID:', error);
        throw error;
    }
}
// Exportar funciones
module.exports = {
    obtenerTodasLasObras,
    obtenerObraPorId,
};
