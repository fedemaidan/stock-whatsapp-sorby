const { Pedido, Movimiento, Material, Obra } = require('../../../models');

async function ObtenerPedido(Nro_Pedido) {
    try {
        const pedido = await Pedido.findOne({
            where: { id: Nro_Pedido },
            include: [
                {
                    model: Movimiento,
                    as: 'movimientos'
                }
            ]
        });

        if (!pedido) {
            throw new Error('Pedido no encontrado');
        }

        // Procesamos los movimientos y los clasificamos por tipo y estado
        const movimientosConObras = await Promise.all(pedido.movimientos.map(async (movimiento) => {
            let materialName = 'Material no encontrado';
            if (movimiento.id_material) {
                const material = await Material.findByPk(movimiento.id_material);
                if (material) {
                    materialName = material.nombre;
                }
            }

            const obraOrigen = await Obra.findByPk(movimiento.cod_obra_origen);
            const obraDestino = await Obra.findByPk(movimiento.cod_obradestino);

            let tipoMovimiento = 'Desconocido';

            if (movimiento.cod_obra_origen && (!movimiento.cod_obradestino || movimiento.cod_obradestino === "No Aplica")) {
                tipoMovimiento = 'Egreso';
            } else if (movimiento.cod_obra_origen && movimiento.cod_obradestino) {
                if (movimiento.cod_obra_origen === movimiento.cod_obradestino) {
                    tipoMovimiento = 'Ingreso';
                } else {
                    tipoMovimiento = 'Transferencia';
                }
            }

            return {
                producto_name: materialName,
                cantidad: movimiento.cantidad,
                obra_origen: obraOrigen ? obraOrigen.nombre : 'No definida',
                obra_destino: obraDestino ? obraDestino.nombre : null,
                tipo: tipoMovimiento,
                estado: movimiento.estado
            };
        }));

        return {
            Nro_Pedido: pedido.id,
            Fecha: pedido.fecha,
            Aclaracion: pedido.aclaracion,
            Estado: pedido.estado,
            movimientos: movimientosConObras,
        };
    } catch (error) {
        console.error('Error obteniendo pedido:', error.message);
        return null;
    }
}

module.exports = ObtenerPedido;
/*
async function ObtenerPedido(Nro_Pedido) {
    try {
        const pedido = await Pedido.findOne({
            where: { id: Nro_Pedido },
            include: [
                {
                    model: Movimiento,
                    as: 'movimientos'
                }
            ]
        });

        if (!pedido) {
            throw new Error('Pedido no encontrado');
        }

        // Procesar los movimientos para clasificar su tipo
        const movimientosConObras = await Promise.all(pedido.movimientos.map(async (movimiento) => {
            let materialName = 'Material no encontrado';
            if (movimiento.id_material) {
                const material = await Material.findByPk(movimiento.id_material);
                if (material) {
                    materialName = material.nombre;
                }
            }

            const obraOrigen = await Obra.findByPk(movimiento.cod_obra_origen);
            const obraDestino = await Obra.findByPk(movimiento.cod_obradestino);

            let tipoMovimiento = 'Desconocido';

            if (movimiento.cod_obra_origen && !movimiento.cod_obradestino) {
                // Egreso: Se retira material del propio stock sin destino
                tipoMovimiento = 'Egreso';
            } else if (movimiento.cod_obra_origen && movimiento.cod_obradestino) {
                if (movimiento.cod_obra_origen === movimiento.cod_obradestino) {
                    // Ingreso: Cuando el material retorna a la misma obra
                    tipoMovimiento = 'Ingreso';
                } else {
                    // Transferencia: Se transfiere material entre obras distintas
                    tipoMovimiento = 'Transferencia';
                }
            }

            return {
                producto_name: materialName,
                cantidad: movimiento.cantidad,
                obra_origen: obraOrigen ? obraOrigen.nombre : 'No definida',
                obra_destino: obraDestino ? obraDestino.nombre : null,
                tipo: tipoMovimiento
            };
        }));

        return {
            Nro_Pedido: pedido.id,
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
*/