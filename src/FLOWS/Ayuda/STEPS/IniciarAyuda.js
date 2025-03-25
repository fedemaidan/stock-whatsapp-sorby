const FlowManager = require('../../../FlowControl/FlowManager');

module.exports = async function IniciarConsultaStock(userId, data, sock) {

    const output = `📌 *Lista de comandos disponibles:*\n\n
    ────────────────────────────\n
    ✅ *Crear Egreso*  \n
      📌 *Ejemplo:* "Ingresar *cantidad* *Nombre del material* a *Nombre de la obra*"\n\n
    ────────────────────────────\n
    ✅ *Crear Ingreso*  \n
      📌 *Ejemplo:* "Ingresar *cantidad* *Nombre del material* a *Nombre de la obra*"\n\n
    ────────────────────────────\n
    🔍 *Consultar Pedido*  \n
      📌 *Ejemplo:* "Consultar pedido nro 15 / Consultar pedido 18"\n\n
    ────────────────────────────\n
    📦 *Consultar Stock*  \n
      📌 *Ejemplo:* "Stock *nombre del material*"\n\n
    ────────────────────────────\n
    🔄 *Transferir Materiales*  \n
      📌 *Ejemplo:* "Transferir *Nombre del material* desde *obra origen* a *obra destino*"\n\n
    ────────────────────────────\n
    ✅ *Confirmación*  \n
      📌 *Ejemplo:* "Quiero confirmar el pedido 24"\n\n`;

        // Enviamos el mensaje con los detalles
        await sock.sendMessage(userId, { text: output });

        // Restablecemos el flujo para la siguiente interacción
        FlowManager.resetFlow(userId);
    };