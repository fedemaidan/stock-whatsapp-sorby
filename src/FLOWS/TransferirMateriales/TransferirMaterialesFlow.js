const FlowManager = require('../../FlowControl/FlowManager')
const {TranferirMaterialesSteps} = require('../TransferirMateriales/TranferirMaterialesSteps');

const TransferirMaterialesFlow = {

    async start(userId, data, sock) {

        await sock.sendMessage(userId, { text: '📝 Registrando su transferencia \n Listando datos detectados:' });

        if (userId != null && sock != null) {
            if (typeof TranferirMaterialesSteps["CrearTransferencia"] === 'function') {
                await TranferirMaterialesSteps["CrearTransferencia"](userId, data, sock);
            } else {
                console.log("El step solicitado no existe");
            }
        } else {
            console.log("Ocurrio un error con los datos")
        }
    },

    async Handle(userId, message, currentStep, sock, messageType) {

        if (userId != null && sock != null) {
            console.log("EN EL HANDLE DEL TRANFERIR MATERIALES")
            console.log(currentStep)

            if (typeof TranferirMaterialesSteps[currentStep] === 'function') {
                await TranferirMaterialesSteps[currentStep](userId, message, sock);
            } else {
                console.log("El step se rompio todo que se yo");
            }

        } else {
            console.log("Ocurrio un error con los datos")
        }
    }

}
module.exports = TransferirMaterialesFlow