const FlowManager = require('./FlowManager');
const EgresoMaterialesFlow = require('../FLOWS/EgresoDeMateriales/EgresoDeMaterialesFlow');
const defaultFlow = require('../FLOWS/INITFLOW/INIT');

class FlowMapper {
    async handleMessage(userId, message, sock, messageType) {
        const flow = FlowManager.getFlow(userId);

        if (flow)
        {
            switch (flow.flowName)
            {
                case 'EGRESOMATERIALES':
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
                await defaultFlow.handle(userId, message, sock, messageType);
            }
            else 
            {
                FlowManager.setFlow(userId, 'INITFLOW');
                await defaultFlow.Init(userId, message, sock, messageType);
            }
        }
    }
}
module.exports = new FlowMapper();
