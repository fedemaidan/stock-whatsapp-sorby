const FlowManager = require('../../../FlowControl/FlowManager');
const DetectarObra = require('../../../Utiles/Chatgpt/Operaciones/DetectarObra');
const moment = require('moment-timezone');
const EfectuarDevolucion = require('../../../Utiles/Helpers/Devolucion/EfectuarDevolucion');

module.exports = async function AsignarOrigenDevolucion(userId, message, sock) {
    try {
        const flowData = FlowManager.userFlows[userId]?.flowData;
        const { devolucion, pedidoID, skipObraIntro, pedidoOriginal } = flowData.data;

        const materialActual = devolucion[0];

        // ✅ Mostrar todas las obras únicas del pedido original, incluyendo FlyDac
        const todasLasObras = new Set();
        pedidoOriginal.forEach(item => {
            (item.obrasDisponibles || []).forEach(o => todasLasObras.add(o));
        });
        todasLasObras.add("FlyDac"); // incluir siempre FlyDac
        const obrasDisponibles = Array.from(todasLasObras);

        // ✅ Si skipObraIntro está activo, mostrar el mensaje sin interpretar input
        if (skipObraIntro) {
            let mensajeIntro = `📍 *¿Dónde querés devolver el siguiente material?*\n\n`;
            mensajeIntro += `🔹 *${materialActual.nombre}* — Cantidad: ${materialActual.cantidad}\n\n`;

            if (obrasDisponibles.length > 0) {
                mensajeIntro += `🏗️ Obras disponibles:\n`;
                mensajeIntro += obrasDisponibles.map(o => `• ${o}`).join('\n');
            } else {
                mensajeIntro += `⚠️ No se detectaron obras asociadas.`;
            }

            await sock.sendMessage(userId, { text: mensajeIntro });

            flowData.data.skipObraIntro = false;
            FlowManager.setFlow(userId, "DEVOLUCION", "AsignarOrigenDevolucion", flowData);
            return;
        }

        // 🎯 Interpretar la respuesta del usuario (nombre de obra) usando lista de obras disponibles
        const resultado = await DetectarObra(message, obrasDisponibles);

        console.log("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯")
        console.log(message)
        console.log("------")
        console.log(obrasDisponibles)
        console.log("------")
        console.log("Resultado de DetectarObra:", resultado);
        console.log("🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯🎯")

        if (!resultado?.data?.obra_id) {
            await sock.sendMessage(userId, {
                text: "⚠️ No pude identificar la obra seleccionada. Por favor, intentá de nuevo con el nombre o número exacto."
            });
            return;
        }

        const obra_id = resultado.data.obra_id;
        const obra_name = resultado.data.obra_name;

        // 📝 Registrar el movimiento
        const nuevoMovimiento = {
            id_material: materialActual.materialId,
            nombre: materialActual.nombre,
            cod_obra_origen: parseInt(obra_id),
            cantidad: materialActual.cantidad,
            tipo: true, // ingreso
            fecha: moment().toDate(),
            nro_pedido: pedidoID,
            estado: 'Devolucion'
        };

        if (!flowData.data.movimientos) flowData.data.movimientos = [];
        flowData.data.movimientos.push(nuevoMovimiento);

        // 🔁 Eliminar el material actual del array de devoluciones
        flowData.data.devolucion.shift();

        // Guardar el flow
        FlowManager.setFlow(userId, "DEVOLUCION", "AsignarOrigenDevolucion", flowData);

        // ✅ Si no quedan más materiales, terminar
        if (flowData.data.devolucion.length === 0) {
            await sock.sendMessage(userId, {
                text: '✅ Todos los materiales fueron asignados para devolución. Procediendo a registrar los movimientos...'
            });
            FlowManager.resetFlow(userId);
            await EfectuarDevolucion(userId, flowData.data.movimientos, sock);
            return;
        }

        // 🆕 Mostrar siguiente material (activar intro para el nuevo)
        const siguiente = flowData.data.devolucion[0];
        flowData.data.skipObraIntro = true;
        FlowManager.setFlow(userId, "DEVOLUCION", "AsignarOrigenDevolucion", flowData);

        // Simular mensaje para iniciar el siguiente paso
        return await module.exports(userId, "", sock);

    } catch (error) {
        console.error("❌ Error en AsignarOrigenDevolucion:", error);
        await sock.sendMessage(userId, {
            text: "❌ Ocurrió un error al asignar la obra de devolución. Intentá de nuevo."
        });
        FlowManager.resetFlow(userId);
    }
};
