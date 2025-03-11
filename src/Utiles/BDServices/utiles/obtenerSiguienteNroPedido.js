const { Pedido } = require("../../../models");

const obtenerSiguienteNroPedido = async () => {
    const ultimoPedido = await Pedido.findOne({
        order: [["id", "DESC"]], // Busca el mayor Nro_Pedido
    });

    // Si no hay pedidos, se devuelve 1, si existe un pedido se devuelve el siguiente Nro_Pedido
    return ultimoPedido ? ultimoPedido.id + 1 : 1;
};

module.exports = { obtenerSiguienteNroPedido };