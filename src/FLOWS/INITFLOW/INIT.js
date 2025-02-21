const { analizarIntencion } = require('../../Utiles/Chatgpt/ChatGpt');
const FlowManager = require('../../FlowControl/FlowManager');
const EgresoDeMaterialesFlow = require('../EgresoDeMateriales/EgresoDeMaterialesFlow');
const defaultFlow = {

    async Init(userId, message, sock, messageType) {
        try {
            /*const result = await analizarIntencion(message);*/
            console.log("-------------*******LLEGO AL INIT********-------------------")
            const result =
            {
                accion: "CrearEgreso",
                data:
                {
                    obra_id: 1,
                    obra_name: "Las toscas",
                    items: [{ producto_id: 1, producto_name: "Cable", cantidad: 10 }, { producto_id: 2, producto_name: "Fierro", cantidad: 5 }]
                }
            }

            console.log(result.accion) //CADA FLOW CONOCE SU INICIAL!

            switch (result.accion)
            {
                case "CrearEgreso":
                    //.setFlow(userId, result.accion, initialStep = null, { data: result.data })
                    EgresoDeMaterialesFlow.start(userId,{ data: result.data },sock)
                    break;

                case "NoRegistrado":
                    Console.log("NO REGISTRADO")
                    break;
            }



            return;
        } catch (err) {
            console.error('Error analizando la intención:', err.message);
            return { accion: 'DESCONOCIDO' };
        }
    },

    async handle(userId, message, sock) {
        await sock.sendMessage(userId, {
            text: 'No entendi tu mensaje, porfavor repitelo',
        });
    },
};

module.exports = defaultFlow;
