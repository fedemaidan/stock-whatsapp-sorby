const FlowManager = require('../../FlowControl/FlowManager')
const { EgresoMaterialSteps } = require('../EgresoDeMateriales/EgresoMaterialSteps');
const { analizarIntencion } = require('../../Utiles/Chatgpt/AnalizarIntencion');
const FlowEgresoMateriales = {

    async start(userId, data, sock)
    {
        await sock.sendMessage(userId, { text: '📝 Registrando su pedido \n Listando datos detectados:' });

        if (userId != null && sock != null) {
            console.log("Entro al step 1 en INIT")

            if (typeof EgresoMaterialSteps["CrearEgreso"] === 'function') {
                await EgresoMaterialSteps["CrearEgreso"](userId,data, sock);
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


            let data = await analizarIntencion(message, userId)

            // Y que EgresoMaterialSteps es un objeto que contiene tus funciones
            if (typeof EgresoMaterialSteps[currentStep] === 'function') {
                await EgresoMaterialSteps[currentStep](userId,data, sock);
            } else {
                console.log("El step solicitado no existe");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = FlowEgresoMateriales