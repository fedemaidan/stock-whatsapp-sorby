const { Pedido, Movimiento, Material, Obra } = require('../../../models');

async function ObtenerPedido(Nro_Pedido) {
    try {
        const pedido = await Pedido.findOne({
            where: { id: Nro_Pedido },  // Usamos 'id' en lugar de 'nro_pedido'
            include: [
                {
                    model: Movimiento,
                    as: 'movimientos',
                    include: []  // No estamos incluyendo 'material' directamente aquí
                }
            ]
        });

        if (!pedido) {
            throw new Error('Pedido no encontrado');
        }

        // Consultar las obras de origen y destino de los movimientos y materiales
        const movimientosConObras = await Promise.all(pedido.movimientos.map(async (movimiento) => {
            // Si el material no está incluido en la consulta, lo buscamos por separado
            let materialName = 'Material no encontrado';
            if (movimiento.id_material) {
                const material = await Material.findByPk(movimiento.id_material);
                if (material) {
                    materialName = material.nombre;
                }
            }

            const obraOrigen = await Obra.findByPk(movimiento.cod_obra_origen);
            const obraDestino = await Obra.findByPk(movimiento.cod_obradestino);

            return {
                producto_name: materialName,
                cantidad: movimiento.cantidad,
                obra_origen: obraOrigen ? obraOrigen.nombre : 'No definida',
                obra_destino: obraDestino ? obraDestino.nombre : 'No definida',
            };
        }));

        return {
            Nro_Pedido: pedido.id,  // Usamos 'id' como el número de pedido
            Fecha: pedido.fecha,
            Estado: pedido.estado,
            movimientos: movimientosConObras,
        };
    } catch (error) {
        console.error('Error obteniendo pedido:', error.message);
        return null;
    }
}

module.exports = ObtenerPedido;
