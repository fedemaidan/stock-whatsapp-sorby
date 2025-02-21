// src/Utiles/messageResponder.js
const FlowMapper = require('../FlowControl/FlowMapper');
const FlowManager = require('../FlowControl/FlowManager');

const messageResponder = async (messageType, msg, sock, sender) =>
{
    switch (messageType) {
        case 'text':
        case 'text_extended': {
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            await FlowMapper.handleMessage(sender, text, sock, messageType);
            break;
        }
        case 'image': {

            await FlowMapper.handleMessage(
                sender,
                msg,
                sock,
                'image'
            );

            break;
        }
        case 'video': {
            const filePath = await downloadMedia(msg.message, 'video');
            if (filePath) {
                await sock.sendMessage(sender, { text: `He recibido tu video y lo he guardado en: ${filePath}` });
            } else {
                await sock.sendMessage(sender, { text: 'No pude guardar el video. Intenta nuevamente.' });
            }
            break;
        }
        case 'audio': {
            const filePath = await downloadMedia(msg.message, 'audio');
            if (filePath) {
                await sock.sendMessage(sender, { text: `He recibido tu audio y lo he guardado en: ${filePath}` });
            } else {
                await sock.sendMessage(sender, { text: 'No pude guardar el audio. Intenta nuevamente.' });
            }
            break;
        }
        case 'document': {
            await FlowMapper.handleMessage(
                sender,
                msg,
                sock,
                'document'
            );
            break;
        }
        case 'document-caption': {
            await FlowMapper.handleMessage(
                sender,
                msg,
                sock,
                'document-caption'
            );
            break;
        }
        default: {
            await sock.sendMessage(sender, {
                text: `No entiendo este tipo de mensaje (${messageType}). Por favor, envíame texto o un comando válido.`,
            });
        }
    }
};

module.exports = messageResponder;


/* ACA VA LA LOGICA QUE INTERPRETA CHAT  Y NOS DEVUELVE ALGO PARA EVALUAR A QUE FLUJO NOS MOVEMOS Y EN QUE STEP
      // Si el mensaje es "Retiro", inicia el flujo de EgresoMaterial
      if (text.trim().toLowerCase() === "retiro") {
          FlowManager.setFlow(sender, "EgresoMaterial", "IngresoDeMaterial", {}); // Asigna el flujo y el step inicial
          await sock.sendMessage(sender, { text: "Iniciando flujo de retiro de material..." });
          console.log(sender)
          await FlowMapper.processMessage(sender,"", sock);
          return; // Puedes salir, o continuar con otro comportamiento
      }
      */