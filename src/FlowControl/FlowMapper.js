const FlowManager = require('./FlowManager');
const EgresoMaterialesFlow = require('../FLOWS/EgresoDeMateriales/EgresoDeMaterialesFlow');
const defaultFlow = require('../FLOWS/INITFLOW/INIT');
// CHE ME LLEGO ESTE TEXTO CON ESTOS DATOS, ESTOY ACA EN ESTE FLOW DONDE VOY ?
//MAPPER ELIJIR A QUE FLOW VA! 


class FlowMapper {
    async handleMessage(userId, message, sock, messageType) {
        const flow = FlowManager.getFlow(userId);

        console.log("-------------*******LLEGO AL MAPPER********-------------------")
        if (flow)
        {
            switch (flow.flowName)
            {
                case 'EGRESOMATERIALES':
                    console.log("-------------*******ENTRO AL HANDLER********-------------------")
                    await EgresoMaterialesFlow.Handle(userId, message, flow.currentStep, sock, messageType);
                    break;

                default:
                    await defaultFlow.handle(userId, message, sock, messageType);
            }
        }
        else
        {
            if (messageType === 'image' || messageType === 'document' || messageType === 'document-caption')
            {
                console.log("---------------------CREANDO NUEVO FLOW---------------------------")
                await defaultFlow.handle(userId, message, sock, messageType);
            }
            else 
            {
                console.log("---------------------CREANDO NUEVO FLOW---------------------------")
                FlowManager.setFlow(userId, 'INITFLOW');
                await defaultFlow.Init(userId, message, sock, messageType);
            }
        }
    }
}
module.exports = new FlowMapper();
