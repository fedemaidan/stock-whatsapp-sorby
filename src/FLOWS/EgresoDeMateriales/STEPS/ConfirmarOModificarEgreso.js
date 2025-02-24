const FlowManager = require('../../../FlowControl/FlowManager')
module.exports = async function ConfirmarOModificarEgreso(userId, data, sock) {


    console.log(data)


    if (data.data.Eleccion == "1") {
        await sock.sendMessage(userId, { text: "🔄 *Procesando...*" });
        await sock.sendMessage(userId, { text: "✅ *Pedido finalizado con éxito.* ¡Gracias por su solicitud! 🙌" });

        FlowManager.resetFlow(userId)
    }
    else {
        await sock.sendMessage(userId, {text:"✏️ *Por favor, indique los cambios que desea realizar en su pedido.*\n\nEjemplo: _Agregar 5 cables y quitar 2 tornillos._"});
        FlowManager.setFlow(userId, "EGRESOMATERIALES", "ModificarPedido", FlowManager.userFlows[userId]?.flowData)
    }
}