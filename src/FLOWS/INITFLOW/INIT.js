const { analizarIntencion } = require('../../Utiles/Chatgpt/AnalizarIntencion');
const FlowManager = require('../../FlowControl/FlowManager');
const EgresoDeMaterialesFlow = require('../EgresoDeMateriales/EgresoDeMaterialesFlow');
const IngresoDeMaterialesFlow = require('../IngresoDeMateriales/IngresoDeMaterialesFlow');
const ConfirmarPedidoFlow = require('../ConfirmarPedido/ConfirmarPedidoFlow');
const defaultFlow = {

    async Init(userId, message, sock, messageType) {
        try {

            //si es texto se analiza en cambio si es una imagen o documento o document-caption este ya se encuentra analizado y salta el "Analizar intencion"
            let result;

            if (messageType == "text" || messageType == "text_extended") {
                result = await analizarIntencion(message, userId);
               
            }
            else
            {
                result = message;
            }


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
