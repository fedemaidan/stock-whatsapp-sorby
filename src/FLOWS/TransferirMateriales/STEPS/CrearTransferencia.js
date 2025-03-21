const FlowManager = require('../../../FlowControl/FlowManager')


module.exports = async function CrearTransferencia(userId, data, sock) {

    const { obra_name_origen, obra_name_destino, items } = data.data;

    // Creamos un string con la información de la obra
    let output = `📋 *Detalles de la Solicitud de transferencia* 📋\n\n🏗️ *Obra Origen:* ${obra_name_origen}\n\n*Obra Receptora:* ${obra_name_destino}\n\n🛒 *Productos Solicitados:*\n`;

    items.forEach(item => {
        output += `🔹 *${item.producto_name}* ➝ Cantidad: *${item.cantidad}*\n`;
    });

    await sock.sendMessage(userId, { text: output });

    await sock.sendMessage(userId, { text: "✅ ¿Desea confirmar la transferencia?\n\n1️⃣ *Sí*, confirmar transferencia\n2️⃣ *No*, realizar cambios\n3️⃣ *Cancelar*, cancelar operación" });

    FlowManager.setFlow(userId, "TRANSFERENCIAMATERIALES","ConfirmarOModificarTransferencia",data)
}

/* 
accion: "Tranfererir Materiales",
        info: "Aqui se debe transferir materiales de una obra hacia otra",
        data:
        {
            obra_id_origen: "El id de la obra de origen a la que se refiere en caso de no referise a una obra dentro del mensaje pon 0",
            obra_name_origen: "Aqui va la obra de origen a la que iran asignado los materiales en caso de no especificarla en el mensaje solo pon GENERAL",
            obra_id_destino: "El id de la obra de destino a la que se refiere en caso de no referise a una obra dentro del mensaje pon 0",
            obra_name_destino: "Aqui va la obra de destino a la que iran asignado los materiales en caso de no especificarla en el mensaje solo pon GENERAL",
            items:
                [
                    {
                        producto_id: "id del producto al que me estoy refiriendo",
                        producto_name: "nombre del producto al que me estoy refiriendo",
                        cantidad: "Cantidad de este material indicado",
                        SKU: "El codigo interno del deposito",
                        zona: "ubicacion, en que zona del deposito se encuentra el material."
                    },
                ]
        }
    },
 */