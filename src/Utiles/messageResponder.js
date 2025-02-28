const FlowMapper = require('../FlowControl/FlowMapper');
const FlowManager = require('../FlowControl/FlowManager');
const transcribeAudio = require('../Utiles/Chatgpt/transcribeAudio');
const downloadMedia = require('../Utiles/Chatgpt/Operaciones/downloadMedia');
const transcribeDoc = require('../Utiles/Chatgpt/transcribeDoc')
const transcribeImage = require('../Utiles/Chatgpt/transcribeImage')

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
            try {
                if (!msg.message || !msg.message.extractedImage || !msg.message.transcribeImage) {
                    await sock.sendMessage(sender, { text: "❌ No se encontró un audio en el mensaje." });
                    return;
                }

                // Pasar el mensaje completo
                const filePath = await downloadMedia(msg, 'image');

                const transcripcion = await transcribeImage(filePath);
                await sock.sendMessage(sender, { text: `📝 He recibido tu audio y lo he transcrito:\n\n${transcripcion}` });

                await FlowMapper.handleMessage(sender, transcripcion, sock, messageType);
            } catch (error) {
                console.error("Error al procesar el audio:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu audio." });
            }
            break;
        }
        case 'video': {
            const filePath = await DownloadMedia(msg.message, 'video');
            if (filePath) {
                await sock.sendMessage(sender, { text: `He recibido tu video y lo he guardado en: ${filePath}` });
            } else {
                await sock.sendMessage(sender, { text: 'No pude guardar el video. Intenta nuevamente.' });
            }
            break;
        }
        case 'audio': {
            try {
                if (!msg.message || !msg.message.audioMessage) {
                    await sock.sendMessage(sender, { text: "❌ No se encontró un audio en el mensaje." });
                    return;
                }

                // Pasar el mensaje completo
                const filePath = await downloadMedia(msg,'audio');

                const transcripcion = await transcribeAudio(filePath);
                await sock.sendMessage(sender, { text: `📝 He recibido tu audio y lo he transcrito:\n\n${transcripcion}` });

                await FlowMapper.handleMessage(sender, transcripcion, sock, messageType);
            } catch (error) {
                console.error("Error al procesar el audio:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu audio." });
            }
            break;
        }
        case 'document': {
            try {
                if (!msg.message || !msg.message.documentMessage) {
                    await sock.sendMessage(sender, { text: "❌ No se encontró un documento en el mensaje." });
                    return;
                }

                // Descargar documento
                const filePath = await downloadMedia(msg, 'document');

                if (!filePath) {
                    await sock.sendMessage(sender, { text: "❌ No se pudo descargar el documento." });
                    return;
                }

                // Verificar si es PDF y extraer texto
                const extractedImage = await extractTextFromPDF(filePath);
                if (!extractedImage) {
                    await sock.sendMessage(sender, { text: "⚠️ No pude extraer el texto del documento." });
                    return;
                }



                await sock.sendMessage(sender, { text: `📄 He extraído el siguiente contenido del documento:\n\n${extractedText}` });

                // Enviar el texto extraído al flujo de procesamiento
                await FlowMapper.handleMessage(sender, extractedText, sock, 'document');
            } catch (error) {
                console.error("Error al procesar el documento:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu documento." });
            }
            break;
        }
        case 'document-caption': {
            try {
                if (!msg.message || !msg.message.documentMessage) {
                    await sock.sendMessage(sender, { text: "❌ No se encontró un documento en el mensaje." });
                    return;
                }

                // Descargar documento
                const filePath = await downloadMedia(msg, 'document-caption');

                if (!filePath) {
                    await sock.sendMessage(sender, { text: "❌ No se pudo descargar el documento." });
                    return;
                }

                // Verificar si es PDF y extraer texto
                const extractedText = await extractTextFromPDF(filePath);
                if (!extractedText) {
                    await sock.sendMessage(sender, { text: "⚠️ No pude extraer el texto del documento." });
                    return;
                }

                await sock.sendMessage(sender, { text: `📄 He extraído el siguiente contenido del documento:\n\n${extractedText}` });

                // Enviar el texto extraído al flujo de procesamiento
                await FlowMapper.handleMessage(sender, extractedText, sock, 'document');
            } catch (error) {
                console.error("Error al procesar el documento:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu documento." });
            }
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