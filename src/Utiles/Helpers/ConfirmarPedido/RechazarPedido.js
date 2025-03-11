const { Pedido, Movimiento, Material, Obra } = require('../../../models'); // Asegúrate de tener la referencia a la tabla 'Obra'
const FlowManager = require('../../../FlowControl/FlowManager');

module.exports = async function RechazarPedido(userId) {
    try {
        // Obtenemos la estructura almacenada en FlowManager
        const flowData = FlowManager.userFlows[userId]?.flowData;
        console.log("*/*/*/*/*/*/*/**/*/*/*/*/*/*/*/*/*/*/*/*/*")
        console.log(flowData)
        console.log("*/*/*/*/*/*/*/**/*/*/*/*/*/*/*/*/*/*/*/*/*")
        if (!flowData || !flowData.Nro_Pedido) {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        const { Nro_Pedido, movimientos } = flowData;

        // Actualizamos el estado del pedido a "Rechazado"
        await Pedido.update(
            { estado: 'Rechazado' },
            { where: { id: Nro_Pedido } }
        );

        // Actualizamos el estado de los movimientos a "Rechazado"
        await Movimiento.update(
            { estado: 'Rechazado' },
            { where: { nro_pedido: Nro_Pedido } }
        );

        // Crear movimientos inversos para devolver el stock
        for (const mov of movimientos) {
            // Buscar el id_material por nombre
            const material = await Material.findOne({
                where: { nombre: mov.producto_name }
            });

            if (!material) {
                console.error(`Error: No se encontró el material con nombre ${mov.producto_name}`);
                return { Success: false, msg: `❌ No se encontró el material con nombre ${mov.producto_name}` };
            }

            // Buscar el id de la obra de origen
            const obraOrigen = await Obra.findOne({
                where: { nombre: mov.obra_origen }
            });

            if (!obraOrigen) {
                console.error(`Error: No se encontró la obra de origen con nombre ${mov.obra_origen}`);
                return { Success: false, msg: `❌ No se encontró la obra de origen con nombre ${mov.obra_origen}` };
            }

            // Determinar la obra de destino. Si no existe, el material vuelve a la obra de origen
            let obraDestinoId = null;

            if (mov.obra_destino && mov.obra_destino !== "No definida") {
                const obraDestinoRecord = await Obra.findOne({
                    where: { nombre: mov.obra_destino }
                });

                if (!obraDestinoRecord) {
                    console.error(`Error: No se encontró la obra de destino con nombre ${mov.obra_destino}`);
                    return { Success: false, msg: `❌ No se encontró la obra de destino con nombre ${mov.obra_destino}` };
                }

                obraDestinoId = obraDestinoRecord.id;
            } else {
                // Si obra_destino no está definida, el material regresa a la obra de origen
                obraDestinoId = obraOrigen.id;
            }

            // Crear el movimiento inverso
            await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: material.id,
                cod_obra_origen: obraDestinoId, // Ahora correctamente apunta a la obra origen si no hay destino
                cod_obradestino: obraOrigen.id,
                cantidad: mov.cantidad,
                tipo: true, // Indica que es una devolución
                nro_pedido: Nro_Pedido,
                estado: 'Devolucion por rechazo'
            });
        }

        return { Success: true, msg: '✅ El pedido ha sido rechazado y el stock ha sido restituido correctamente.' };
    } catch (error) {
        console.error('Error al rechazar el pedido:', error.message);
        return { Success: false, msg: `❌ Error al rechazar el pedido: ${error.message}` };
    }
}

const obtenerFecha = () => new Date();
