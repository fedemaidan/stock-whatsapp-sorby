const { proto } = require('@whiskeysockets/baileys');

// Funci�n para simular un mensaje enviado por el usuario
const simularMensaje = async (sock, userId) => {
    const fakeMessage = {
        key: {
            remoteJid: userId,
            fromMe: false,
            id: "mensaje-falso-" + Date.now(),
        },
        message: {
            conversation: "hola",  // Este es el mensaje simulado
        },
        participant: userId,
    };

    sock.ev.emit("messages.upsert", { messages: [fakeMessage], type: "notify" });

    console.log(`Simulado mensaje de ${userId}: "${fakeMessage.message.conversation}"`);
};

module.exports = { simularMensaje };  // Aseg�rate de que est� exportado correctamente