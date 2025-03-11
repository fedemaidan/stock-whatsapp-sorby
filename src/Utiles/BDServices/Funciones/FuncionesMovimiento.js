const Movimiento = require("../../../models/Movimiento");

const guardarMovimiento = async (datos) => {
    try {
        const nuevoMovimiento = await Movimiento.create(datos);
        return { success: true, message: "Movimiento guardado correctamente", data: nuevoMovimiento };
    } catch (error) {
        console.error("Error al guardar el movimiento:", error);
        return { success: false, message: "Error al guardar el movimiento", error: error.message };
    }
};

const obtenerMovimientos = async (nroPedido, codObraDestino) => {
    try {
        const whereClause = { Nro_Pedido: nroPedido };

        if (codObraDestino !== 0) {
            whereClause.Cod_ObraDestino = codObraDestino;
        }

        const movimientos = await Movimiento.findAll({ where: whereClause });

        return { success: true, data: movimientos };
    } catch (error) {
        console.error("Error al obtener los movimientos:", error);
        return { success: false, message: "Error al obtener los movimientos", error: error.message };
    }
};

module.exports = { guardarMovimiento, obtenerMovimientos };