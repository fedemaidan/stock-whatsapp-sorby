
const { EgresoMaterialSteps } = require('../EgresoDeMateriales/EgresoMaterialSteps');

const FlowEgresoMateriales = {

    async start(userId, Data, sock)
    {
        await sock.sendMessage(userId, { text: '📝 Registrando su pedido \n Listando datos detectados:' });

        if (userId != null  && sock != null) {
            await EgresoMaterialSteps.CrearEgreso(userId, Data, sock)
        } else
        {
            await sock.sendMessage(userId, { text: "Ocurrio un error con los datos" });
            console.error("----------FALLO EN EgresoMaterialSteps Start ya que Algun parametro fue null al ingresar---------------")
        }
    },

    async Handle(userId, message, currentStep, sock, messageType) { 

        if (userId != null && sock != null) {

            /* MODIFICAR PEDIDO*/
            const result =
            {
                accion: "CrearEgreso",
                data:
                {
                    obra_id: 1,
                    obra_name: "Las toscas",
                    items: [{ producto_id: 1, producto_name: "Cable", cantidad: 20 }, { producto_id: 2, producto_name: "Fierro", cantidad: 50 }]
                }
            }
            let data = {}

            //ME PIDE O EL MENSAJE O EL DATO ESTO DEBERIA INTERPRETARLO CHAT ?

            console.log(currentStep)
            switch (currentStep) {
                case "ConfirmarOModificarEgreso":
                    data = message
                    break

                case "ModificarPedido":
                    data = result.data
                    break
            }
            
            const stepName = currentStep; // "CrearEgreso" por ejemplo

            // Y que EgresoMaterialSteps es un objeto que contiene tus funciones
            if (typeof EgresoMaterialSteps[stepName] === 'function') {
                await EgresoMaterialSteps[stepName](userId, { data: data }, sock);
            } else {
                await sock.sendMessage(userId, { text: "El step solicitado no existe" });
            }

        } else {
            await sock.sendMessage(userId, { text: "Ocurrio un error con los datos" });
            console.error("----------FALLO EN EgresoMaterialSteps Handler ya que Algun parametro fue null al ingresar---------------")
        }
    }

}
module.exports = FlowEgresoMateriales