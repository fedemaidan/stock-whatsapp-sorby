const opcionElegida = require("../../../Utiles/Chatgpt/Operaciones/opcionElegida");
const FlowManager = require('../../../FlowControl/FlowManager');
const realizarMovimientoRetiro = require('../../../Utiles/Helpers/EgresoMateriales/realizarMovimientoRetiro');
const obtenerDisponibilidad = require('../../../Utiles/Helpers/EgresoMateriales/obtenerDisponibilidad');
const enviarPDFWhatsApp = require('../../../Utiles/Helpers/EgresoMateriales/EnviarConformidad');

module.exports = async function ConfirmarOModificarEgreso(userId, message, sock) {
    const data = await opcionElegida(message);
    const flowData = FlowManager.userFlows[userId]?.flowData;

    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 Procesando..." });

        // Lógica que controla la disponibilidad de stock.
        const Operacion = await obtenerDisponibilidad(flowData.data.obra_id, flowData.data.items);

        switch (Operacion.Success) {
            case "Hay stock":
                await sock.sendMessage(userId, { text: `✅ La obra principal tiene suficiente stock para cubrir el pedido.` });
                const resultado = await realizarMovimientoRetiro(userId); 

                if (resultado.Success)
                {
                    await enviarPDFWhatsApp(resultado.FiletPath, sock, userId);
                    await sock.sendMessage(userId, { text: `✅ La operacion se realizo exitosamente.` });
                    FlowManager.resetFlow(userId);
                }
                else
                {
                    await sock.sendMessage(userId, { text: resultado.msg });
                    FlowManager.resetFlow(userId);
                }
                FlowManager.resetFlow(userId);
                break;

            case "Otras obras":
                // Mostrar el mensaje generado por `obtenerDisponibilidad`
                // await sock.sendMessage(userId, { text: Operacion.msg });


                // Habilitar el siguiente paso para que el usuario elija desde qué obra quiere el apoyo
                const productosFaltantes = Operacion.ProductosFaltantes;

                if (productosFaltantes.length > 0) {
                    const primerProducto = productosFaltantes[0];

                    let mensaje = `⚠️ *Falta stock para un producto*\n\n`;
                    mensaje += `📌 *${primerProducto.nombre}* - Necesita ${primerProducto.cantidadFaltante} unidades\n\n`;
                    mensaje += `🏗️ Obras con stock disponible:\n`;

                    primerProducto.opcionesObras.forEach((obra, index) => {
                        mensaje += `   ${index + 1}. *${obra.nombre}* - ${obra.stockDisponible} unidades\n`;
                    });

                    mensaje += `\n✏️ Responde con el número de la obra de donde quieres retirar el material.`;

                    await sock.sendMessage(userId, { text: mensaje });
                }

                FlowManager.setFlow(userId, "EGRESOMATERIALES", "RetirarEgresoFiltrado", { ...FlowManager.userFlows[userId]?.flowData, ...Operacion });

                break;

            case "No stock":
                await sock.sendMessage(userId, { text: `🚫 ${Operacion.msg}` });

                const faltantesTotales = Operacion.materialesFaltantesTotales;

                if (faltantesTotales?.length > 0) {
                    let mensaje = `\n📦 *Materiales sin stock suficiente:*\n\n`;

                    faltantesTotales.forEach((prod, index) => {
                        mensaje += `${index + 1}. *${prod.nombre}* - Faltan ${prod.cantidadFaltante} unidades\n`;
                    });

                    mensaje += `\n🛑 No se pueden cubrir ni desde la obra principal ni con apoyo de otras obras.`;

                    await sock.sendMessage(userId, { text: mensaje });
                }

                FlowManager.resetFlow(userId);
                break;

        }

    } else if (data.data.Eleccion == "2") {
        await sock.sendMessage(userId, {
            text: "✏️ *Por favor, indique los cambios que desea realizar en su pedido.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._"
        });
        FlowManager.setFlow(userId, "EGRESOMATERIALES", "ModificarPedido", flowData);
    } else if (data.data.Eleccion == "3") {
        await sock.sendMessage(userId, { text: "❌ La operación ha sido cancelada." });
        FlowManager.resetFlow(userId);
    } else {
        await sock.sendMessage(userId, { text: "Disculpa, no lo he entendido." });
    }
};
