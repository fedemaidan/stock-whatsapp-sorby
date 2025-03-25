const { AyudaSteps } = require('../Ayuda/AyudaSteps');

const AyudaFlow = {

    async start(userId, data, sock) {

        if (userId != null && sock != null) {
            if (typeof AyudaSteps["IniciarAyuda"] === 'function') {
                await AyudaSteps["IniciarAyuda"](userId, data, sock);
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
            if (typeof AyudaSteps[currentStep] === 'function') {
                await AyudaSteps[currentStep](userId, message, sock);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = AyudaFlow