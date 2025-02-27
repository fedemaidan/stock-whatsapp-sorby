const FlowManager = require('../../FlowControl/FlowManager')
const { CornfirmarPedidoSteps } = require('../ConfirmarPedido/CornfirmarPedidoSteps');

const ConfirmarPedidoFlow = {

    async start(userId, data, sock) {
        await sock.sendMessage(userId, { text: '📝 Recopilando datos del pedido deseado \n Listando datos detectados:' });

        if (userId != null && sock != null) {
            if (typeof CornfirmarPedidoSteps["CrearConfirmacion"] === 'function') {
                await CornfirmarPedidoSteps["CrearConfirmacion"](userId, data, sock);
            } else {
                console.log("El step solicitado no existe");
            }
        } else {
            console.log("Ocurrio un error con los datos")
        }
    },

    async Handle(userId, message, currentStep, sock, messageType) {

        if (userId != null && sock != null) {

            // Y que EgresoMaterialSteps es un objeto que contiene tus funciones
            if (typeof CornfirmarPedidoSteps[currentStep] === 'function') {
                await CornfirmarPedidoSteps[currentStep](userId, message, sock);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = ConfirmarPedidoFlow