const GetMessageType = require("../../src/Utiles/GetType");
const messageResponder = require("../../src/Utiles/messageResponder");

class SockSingleton {
    constructor() {
        if (!SockSingleton.instance) {
            this.sock = {}; // Se guardará la instancia única de sock
            SockSingleton.instance = this;
        }
        return SockSingleton.instance;
    }
    async setSock(sockInstance) {
        this.sock = sockInstance;

        this.sock.ev.on('messages.upsert', async (message) => {
            
            if (message.type === 'notify') {
                const msg = message.messages[0];
                if (!msg.message || msg.key.fromMe) return;

                const sender = msg.key.remoteJid;
                const messageType = GetMessageType(msg.message);

                await messageResponder(messageType,msg, this.sock ,sender);
            }
            else if (message.type === 'append') {}
        });
        setInterval(async () => await this.sock.sendPresenceUpdate('available'), 10 * 60 * 1000);
    }
    // Obtiene la instancia del sock
    getSock() {
    if (!this.sock) {
        console.error('🛑 Sock aún no está listo, espera antes de enviar el mensaje.');
        return null;
    }
    return this.sock;
}

}
module.exports = new SockSingleton();
