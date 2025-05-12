const FlowManager = require('../../../FlowControl/FlowManager');
const opciondevMateriales = require('../../../Utiles/Chatgpt/Operaciones/opciondevMateriales');

module.exports = async function validarDevolucion(userId, message, sock) {
    try {
        const flowData = FlowManager.userFlows[userId]?.flowData;

        // Validamos que haya pedido original
        if (!flowData?.data?.pedidoOriginal || flowData.data.pedidoOriginal.length === 0) {
            await sock.sendMessage(userId, { text: '❌ No se encontraron datos del pedido original. Reiniciá el proceso.' });
            return FlowManager.resetFlow(userId);
        }

        // 🔍 Usamos GPT para interpretar los materiales que quiere devolver
        const resultado = await opciondevMateriales(message, flowData.data);

        // Validación básica
        if (!resultado || !Array.isArray(resultado.devolucion) || resultado.devolucion.length === 0) {
            await sock.sendMessage(userId, {
                text: "⚠️ No pude interpretar correctamente los materiales que querés devolver. Intentá escribirlo de nuevo, por ejemplo:\n\nCemento 5, Arena 10"
            });
            return;
        }

        // Guardamos en flowData
        flowData.data.devolucion = resultado.devolucion;

        // Mensaje de confirmación de interpretación
        let mensaje = `✅ Estos son los materiales detectados para devolución:\n`;
        resultado.devolucion.forEach((item, i) => {
            mensaje += `\n${i + 1}. *${item.nombre}* — Cantidad: ${item.cantidad}`;
        });

        // Guardamos el flow
        FlowManager.setFlow(userId, "DEVOLUCION", "AsignarOrigenDevolucion", flowData);

        // Enviamos al usuario
        await sock.sendMessage(userId, { text: mensaje });

         //-----------------------------------------------
 const { devolucion, pedidoOriginal } = flowData.data;
const materialActual = devolucion[0];

        // ✅ Recolectar todas las obras únicas del pedido original
        const todasLasObras = new Set();

        pedidoOriginal.forEach(item => {
            (item.obrasDisponibles || []).forEach(obraNombre => {
                todasLasObras.add(obraNombre);
            });
        });

        // ✅ Agregar FlyDac si no está
        if (!todasLasObras.has('FlyDac')) {
            todasLasObras.add('FlyDac');
        }

        // ✉️ Armar el mensaje
        let mensajeIntro = `📍 *¿Dónde querés devolver el siguiente material?*\n\n`;
        mensajeIntro += `🔹 *${materialActual.nombre}* — Cantidad: ${materialActual.cantidad}\n\n`;

        if (todasLasObras.size === 0) {
            mensajeIntro += `⚠️ No se detectaron obras asociadas al pedido original.`;
        } else {
            mensajeIntro += `🏗️ Obras disponibles:\n`;
            mensajeIntro += Array.from(todasLasObras).map(o => `• ${o}`).join('\n');
        }


await sock.sendMessage(userId, { text: mensajeIntro });
//--------------------------------------------------

    } catch (error) {
        console.error("❌ Error en ValidarDevolucion:", error);
        await sock.sendMessage(userId, { text: '❌ Hubo un problema al procesar la devolución. Intentá nuevamente.' });
        FlowManager.resetFlow(userId);
    }
};
