const FlowManager = require('../../FlowControl/FlowManager')
const { EgresoMaterialSteps } = require('../EgresoDeMateriales/EgresoMaterialSteps');
const { analizarIntencion } = require('../../Utiles/Chatgpt/AnalizarIntencion');
const FlowEgresoMateriales = {

    async start(userId, data, sock)
    {
        await sock.sendMessage(userId, { text: '📝 Registrando su pedido \n Listando datos detectados:' });

        if (userId != null && sock != null) {
            if (typeof EgresoMaterialSteps["CrearEgreso"] === 'function') {
                await EgresoMaterialSteps["CrearEgreso"](userId, data, sock);
            } else {
                console.log("El step solicitado no existe");
            }
        } else
        {
            console.log("Ocurrio un error con los datos")
        }
    },

    async Handle(userId, message, currentStep, sock, messageType) { 

        if (userId != null && sock != null) {

            // Y que EgresoMaterialSteps es un objeto que contiene tus funciones
            if (typeof EgresoMaterialSteps[currentStep] === 'function') {
                await EgresoMaterialSteps[currentStep](userId, message, sock);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = FlowEgresoMateriales