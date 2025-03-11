const Movimiento = require("../../../models/Movimiento");

const obtenerSiguienteCodigoMovimiento = async () => {
    try {
        // Obtener el último Cod_movimiento registrado en la base de datos
        const ultimoMovimiento = await Movimiento.findOne({
            attributes: ["id"],
            order: [["id", "DESC"]], // Ordenar en orden descendente para obtener el más reciente
        });

        if (!ultimoMovimiento) {
            console.log('No hay movimientos en la BD. Se usará "Cod_movimiento" inicial en 1.');
            return 1;
        }

        return ultimoMovimiento.Cod_movimiento + 1;
    } catch (error) {
        console.error("Error al obtener el siguiente código de movimiento:", error);
        return 1;
    }
};

module.exports = { obtenerSiguienteCodigoMovimiento };
