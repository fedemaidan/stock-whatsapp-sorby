const FlowManager = require('../../FlowControl/FlowManager')
const { IngresoMaterialSteps } = require('../IngresoDeMateriales/IngresoMaterialSteps');
const FlowEgresoMateriales = {

    async start(userId, data, sock) {
        await sock.sendMessage(userId, { text: '📝 Registrando la carga de materiales \n Listando datos detectados:' });

        if (userId != null && sock != null) {
            if (typeof IngresoMaterialSteps["CrearIngreso"] === 'function') {
                await IngresoMaterialSteps["CrearIngreso"](userId, data, sock);
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
            if (typeof IngresoMaterialSteps[currentStep] === 'function') {
                await IngresoMaterialSteps[currentStep](userId, message, sock);
            } else {
                console.log(currentStep);
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = FlowEgresoMateriales