const FlowManager = require('../../FlowControl/FlowManager')
const { DevolucionSteps } = require('../Devolucion/DevolucionSteps');

const ConsultarStockFlow = {

    async start(userId, data, sock) {

        await sock.sendMessage(userId, { text: '📝 Registrando su devolucon \n Listando materiales del remito:' });

        if (userId != null && sock != null) {
            if (typeof DevolucionSteps["iNiciarDevolucion"] === 'function') {
                await DevolucionSteps["iNiciarDevolucion"](userId, data, sock);
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
            if (typeof DevolucionSteps[currentStep] === 'function') {
                await DevolucionSteps[currentStep](userId, message, sock);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = ConsultarStockFlow