const PDFDocument = require('pdfkit');
const fs = require('fs');
const { default: makeWASocket, MessageType, Mimetype } = require('@whiskeysockets/baileys');

module.exports = async function generarPDFConformidad(obraName, nroPedido, items, sock, recipient) {
    const doc = new PDFDocument({ margin: 50 });
    const filePath = `Conformidad_${obraName.replace(/\s+/g, '_')}_Pedido_${nroPedido}.pdf`;
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Título
    doc.fontSize(18).text("CONFORMIDAD DE RECEPCIÓN", { align: "center" }).moveDown(2);

    // Nombre de la obra y número de pedido
    doc.fontSize(14).text(`Obra: ${obraName}`).moveDown(1);
    doc.fontSize(14).text(`Número de Pedido: ${nroPedido}`).moveDown(1);

    // Tabla de ítems
    doc.fontSize(12).text("Detalle de ítems recepcionados:").moveDown(1);

    // Encabezado de la tabla
    doc.fontSize(12).text("Ítem", 50, doc.y, { width: 300, underline: true });
    doc.text("Cantidad", 350, doc.y, { width: 100, underline: true }).moveDown(1);

    // Contenido de la tabla
    items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.item_name}`, 50, doc.y, { width: 300 });
        doc.text(`${item.cantidad}`, 350, doc.y, { width: 100 }).moveDown(1);
    });

    doc.moveDown(3);

    // Espacio para firmas
    doc.text("__________________________", 100, doc.y);
    doc.text("Firma del Responsable", 100, doc.y);
    doc.moveDown(2);
    doc.text("__________________________", 350, doc.y);
    doc.text("Firma del Receptor", 350, doc.y);

    doc.end();

    stream.on("finish", async () => {
        console.log(`PDF generado: ${filePath}`);
        await enviarPDFWhatsApp(sock, recipient, filePath);
    });

    return filePath;
}
// Función para enviar el PDF por WhatsApp
async function enviarPDFWhatsApp(sock, recipient, filePath) {
    try {
        const pdfBuffer = fs.readFileSync(filePath);
        await sock.sendMessage(recipient, {
            document: pdfBuffer,
            mimetype: Mimetype.pdf,
            fileName: filePath
        });
        console.log(`PDF enviado a ${recipient}`);
    } catch (error) {
        console.error("Error enviando el PDF:", error);
    }
}
