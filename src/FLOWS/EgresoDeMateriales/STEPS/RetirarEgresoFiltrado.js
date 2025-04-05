const FlowManager = require('../../../FlowControl/FlowManager');
const DetectarObra = require('../../../Utiles/Chatgpt/Operaciones/DetectarObra');
const realizarMovimientoRetiroObraAjena = require('../../../Utiles/Helpers/EgresoMateriales/realizarMovimientoRetiroObraAjena');
const enviarPDFWhatsApp = require('../../../Utiles/Helpers/EgresoMateriales/EnviarConformidad');

module.exports = async function RetirarEgresoFiltrado(userId, message, sock) {
    const flowData = FlowManager.userFlows[userId]?.flowData;

    if (!flowData || !flowData.ProductosFaltantes || !flowData.data) {
        await sock.sendMessage(userId, { text: "❌ No hay flujo de productos pendientes." });
        return FlowManager.resetFlow(userId);
    }

    const productosFaltantes = flowData.ProductosFaltantes;
    const pedidoFinal = flowData.pedido_final || [];
    const productoActual = productosFaltantes[0]; // Siempre trabajamos sobre el primero
    const opciones = productoActual.opcionesObras;

    // Detectar qué obra eligió el usuario usando ChatGPT
    (productoActual.opcionesObras)
    const resultadoObra = await DetectarObra(message, productoActual.opcionesObras, userId);

    if (!resultadoObra || resultadoObra.accion !== "Detectar Obra" || !resultadoObra.data) {
        await sock.sendMessage(userId, { text: "❗ No pude identificar la obra. Por favor, intenta de nuevo." });
        return;
    }

    const obraDetectadaId = parseInt(resultadoObra.data.obra_id);
    const obraSeleccionada = opciones.find(o => o.id === obraDetectadaId);

    if (!obraSeleccionada) {
        await sock.sendMessage(userId, { text: `❗ La obra que mencionaste no está entre las opciones disponibles para este producto.` });
        return;
    }

    const stockAUsar = Math.min(obraSeleccionada.stockDisponible, productoActual.cantidadFaltante);

    // Agregar a pedido_final
    const indexEnFinal = pedidoFinal.findIndex(p => p.id === productoActual.id);
    if (indexEnFinal === -1) {
        pedidoFinal.push({
            id: productoActual.id,
            nombre: productoActual.nombre,
            cantidadFaltante: productoActual.cantidadFaltante,
            obrasSeleccionadas: [{
                id: obraSeleccionada.id,
                nombre: obraSeleccionada.nombre,
                stockRequerido: stockAUsar
            }]
        });
    } else {
        pedidoFinal[indexEnFinal].obrasSeleccionadas.push({
            id: obraSeleccionada.id,
            nombre: obraSeleccionada.nombre,
            stockRequerido: stockAUsar
        });
    }

    // Actualizar cantidad faltante
    productoActual.cantidadFaltante -= stockAUsar;

    // Eliminar obra usada de las opciones
    productoActual.opcionesObras = productoActual.opcionesObras.filter(o => o.id !== obraSeleccionada.id);

    // Si ya cubrimos el total, eliminamos el producto del listado de faltantes
    if (productoActual.cantidadFaltante <= 0) {
        productosFaltantes.shift();
    }

    // Guardar actualización en FlowManager
    FlowManager.setFlow(userId, "EGRESOMATERIALES", "RetirarEgresoFiltrado", {
        ...flowData,
        ProductosFaltantes: productosFaltantes,
        pedido_final: pedidoFinal
    });

    // Mostrar siguiente producto (si hay)
    if (productosFaltantes.length > 0) {
        const siguiente = productosFaltantes[0];
        let mensaje = `⚠️ *Falta stock para un producto*\n\n`;
        mensaje += `📌 *${siguiente.nombre}* - Necesita ${siguiente.cantidadFaltante} unidades\n\n`;
        mensaje += `🏗️ Obras con stock disponible:\n`;

        siguiente.opcionesObras.forEach((obra, index) => {
            mensaje += `   ${index + 1}. *${obra.nombre}* - ${obra.stockDisponible} unidades\n`;
        });

        mensaje += `\n✏️ Escribe el nombre o número de la obra de la que quieres retirar el material.`;
        await sock.sendMessage(userId, { text: mensaje });
    } else {
        await sock.sendMessage(userId, { text: "✅ Todos los productos fueron cubiertos. Procediendo con el pedido..." });
        const resultado = await realizarMovimientoRetiroObraAjena(userId)

        if (resultado.Success)
        {
            await enviarPDFWhatsApp(resultado.FiletPath, sock, userId);
            await sock.sendMessage(userId, { text: `✅ La operacion se realizo exitosamente.` });
        }
        else
        {
            await sock.sendMessage(userId, { text: resultado.msg });
        }

        FlowManager.resetFlow(userId);
        // Podrías continuar con registrar movimientos acá si querés
    }
};
