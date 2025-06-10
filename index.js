const connectToWhatsApp = require('./src/whatsapp');

const startBot = async () => {
    const sock = await connectToWhatsApp();
    setInterval(() => console.log('Keep-alive'), 5 * 60 * 1000);
};

startBot();
