const { Movimiento, Material, Obra } = require('../../../models');
const FlowManager = require('../../../FlowControl/FlowManager');
const listarMov = require('../../../Utiles/Helpers/Devolucion/listarMov');

module.exports = async function IniciarDevolucion(userId, flowData, sock) {
    const { pedidoID } = flowData.data;

    try {
        // Encontrar movimientos por pedido
        const movimientos = await listarMov(pedidoID);

        if (!movimientos || movimientos.length === 0) {
            await sock.sendMessage(userId, { text: `❌ No se encontraron movimientos para el pedido #${pedidoID}.` });
            return FlowManager.resetFlow(userId);
        }

        // 🔒 VALIDACIÓN: Si ya hay alguna devolución registrada, cancelar
        const yaDevolvio = movimientos.some(m => m.estado?.toLowerCase() === 'devolucion');
        if (yaDevolvio) {
            await sock.sendMessage(userId, {
                text: `⚠️ Este pedido ya tiene registrada al menos una devolución. No se puede repetir la operación.`
            });
            return FlowManager.resetFlow(userId);
        }

        // Agrupar por material
        const agrupados = {};
        for (const mov of movimientos) {
            const id = mov.id_material;
            if (!agrupados[id]) {
                agrupados[id] = {
                    materialId: id,
                    nombre: mov.material?.nombre || 'Desconocido',
                    cantidad: 0,
                    obrasDisponibles: new Set()
                };
            }

            agrupados[id].cantidad += mov.cantidad;

            if (mov.cod_obra_origen) {
                agrupados[id].obrasDisponibles.add(mov.cod_obra_origen);
            }
        }

        // Buscar nombres de obras
        const obraIds = Array.from(
            new Set(movimientos.map(m => m.cod_obra_origen).filter(Boolean))
        );

        const obras = await Obra.findAll({
            where: { id: obraIds },
            attributes: ['id', 'nombre']
        });

        const obrasMap = {};
        obras.forEach(o => obrasMap[o.id] = o.nombre);

        // Convertir obrasDisponibles a arrays de nombres
        const pedidoOriginal = Object.values(agrupados).map(item => ({
            ...item,
            obrasDisponibles: Array.from(item.obrasDisponibles).map(id => obrasMap[id] || `Obra ${id}`)
        }));

        // Mostrar resumen al usuario
        let resumen = `📦 *Resumen del pedido #${pedidoID}*\n`;
        pedidoOriginal.forEach((item, i) => {
            resumen += `\n🔹 ${i + 1}. *${item.nombre}* — Cantidad entregada: ${item.cantidad}`;
        });
        resumen += `\n\n✏️ Indicá los productos que querés devolver, ejemplo:\n\n*Cemento 5, Arena 10*`;

        // Guardar en flow
        flowData.data.pedidoOriginal = pedidoOriginal;
        FlowManager.setFlow(userId, "DEVOLUCION", "validarDevolucion", flowData);

        await sock.sendMessage(userId, { text: resumen });

    } catch (error) {
        console.error("❌ Error en IniciarDevolucion:", error);
        await sock.sendMessage(userId, { text: "❌ Ocurrió un error al procesar la devolución. Intentá nuevamente." });
        FlowManager.resetFlow(userId);
    }
};