const FlowMapper = require('../FlowControl/FlowMapper');
const FlowManager = require('../FlowControl/FlowManager');
const transcribeAudio = require('../Utiles/Chatgpt/transcribeAudio');
const downloadMedia = require('../Utiles/Chatgpt/Operaciones/DownloadMedia');
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
                // Verificar si el mensaje tiene una imagen (no audio)
                if (!msg.message || !msg.message.imageMessage) {
                    await sock.sendMessage(sender, { text: "❌ No se encontró una imagen en el mensaje." });
                    return;
                }

                // Descargar la imagen
                const filePath = await downloadMedia(msg,'image');

                if (!filePath) {
                    await sock.sendMessage(sender, { text: "❌ No se pudo descargar la imagen." });
                    return;
                }

                // Realizar OCR sobre la imagen para extraer el texto
                const transcripcion = await transcribeImage(filePath);

                if (!transcripcion) {
                    await sock.sendMessage(sender, { text: "⚠️ No pude extraer texto de la imagen." });
                    return;
                }

                // Enviar el texto extraído al flujo de procesamiento
                await FlowMapper.handleMessage(sender, transcripcion, sock, 'text');

            } catch (error) {
                console.error("Error al procesar la imagen:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu imagen." });
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
                await FlowMapper.handleMessage(sender, transcripcion, sock, messageType);
            } catch (error) {
                console.error("Error al procesar el audio:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu audio." });
            }
            break;
        }
        case 'document': {
            try {
        
                // Extraer el mensaje de documento desde diferentes posibles estructuras
                const documentMessage =
                    msg?.message?.documentMessage ||
                    msg?.message?.documentWithCaptionMessage?.message?.documentMessage;

                if (!documentMessage) {
                    console.log("❌ No se encontró un documento en el mensaje.");
                    await sock.sendMessage(sender, { text: "❌ No se encontró un documento en el mensaje." });
                    return;
                }

                const filePath = await downloadMedia({ message: { documentMessage } }, 'document');

                if (!filePath) {
                    console.log("❌ Error: No se pudo descargar el documento.");
                    await sock.sendMessage(sender, { text: "❌ No se pudo descargar el documento." });
                    return;
                }

                const transcripcion = await transcribeDoc(filePath);
                const text = await transcribeImage(transcripcion);

                await FlowMapper.handleMessage(sender, text, sock, "text");

            } catch (error) {
                console.error("❌ Error al procesar el documento:", error);
                await sock.sendMessage(sender, { text: "❌ Hubo un error al procesar tu documento." });
            }
            break;
        }
        case 'document-caption':{
            try {

                // Extraer el mensaje de documento desde diferentes posibles estructuras
                const documentMessage =
                    msg?.message?.documentMessage ||
                    msg?.message?.documentWithCaptionMessage?.message?.documentMessage;

                if (!documentMessage) {
                    console.log("❌ No se encontró un documento en el mensaje.");
                    await sock.sendMessage(sender, { text: "❌ No se encontró un documento en el mensaje." });
                    return;
                };
                const filePath = await downloadMedia({ message: { documentMessage } }, 'document-caption');

                if (!filePath) {
                    console.log("❌ Error: No se pudo descargar el documento.");
                    await sock.sendMessage(sender, { text: "❌ No se pudo descargar el documento." });
                    return;
                }

                const transcripcion = await transcribeDoc(filePath);
                const text = await transcribeImage(transcripcion);

                await FlowMapper.handleMessage(sender, text, sock, "text");

            } catch (error) {
                console.error("❌ Error al procesar el documento:", error);
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
