
const { Movimiento, Material } = require('../../../models');


module.exports = async function name(pedidoID) {
    
 const movimientos = await Movimiento.findAll({
            where: { nro_pedido: pedidoID },
            include: [{ model: Material, as: 'material' }]
        });
    
    return movimientos
    }



