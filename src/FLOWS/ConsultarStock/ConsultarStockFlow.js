const FlowManager = require('../../FlowControl/FlowManager')
const { ConsultarStockSteps } = require('../ConsultarStock/ConsultarStockSteps');

const ConsultarStockFlow = {

    async start(userId, data, sock) {

        await sock.sendMessage(userId, { text: '📝 Registrando su consulta \n Listando datos detectados:' });

        if (userId != null && sock != null) {
            if (typeof ConsultarStockSteps["IniciarConsultaStock"] === 'function') {
                await ConsultarStockSteps["IniciarConsultaStock"](userId, data, sock);
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
            if (typeof ConsultarStockSteps[currentStep] === 'function') {
                await ConsultarStockSteps[currentStep](userId, message, sock);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = ConsultarStockFlow