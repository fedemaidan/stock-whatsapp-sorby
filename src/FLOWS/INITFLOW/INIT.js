const { analizarIntencion } = require('../../Utiles/Chatgpt/AnalizarIntencion');
const FlowManager = require('../../FlowControl/FlowManager');
const EgresoDeMaterialesFlow = require('../EgresoDeMateriales/EgresoDeMaterialesFlow');
const IngresoDeMaterialesFlow = require('../IngresoDeMateriales/IngresoDeMaterialesFlow');
const ConfirmarPedidoFlow = require('../ConfirmarPedido/ConfirmarPedidoFlow');
const defaultFlow = {

    async Init(userId, message, sock, messageType) {
        try {
            const result = await analizarIntencion(message, userId);

            console.log(JSON.stringify(result, null, 2));

            switch (result.accion)
            {
                case "Crear Egreso":
                    EgresoDeMaterialesFlow.start(userId,{ data: result.data },sock)
                    break;

                case "Crear Ingreso":
                    IngresoDeMaterialesFlow.start(userId, { data: result.data }, sock)
                    break;


                case "Crear Confirmacion":
                    ConfirmarPedidoFlow.start(userId, { data: result.data }, sock)
                    break;

                case "NoRegistrado":
                    console.log("NO REGISTRADO")
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
