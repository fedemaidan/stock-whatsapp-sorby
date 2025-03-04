const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const FlowManager = require('../../../FlowControl/FlowManager')

module.exports = async function generarPDFConformidad(sock, userId) {
    const pedido = FlowManager.userFlows[userId]?.flowData;

    if (!pedido || !pedido.data) {
        console.error("No se encontró el pedido o los datos son inválidos.");
        return;
    }

    const { obra_name, items } = pedido.data; // Obtener obra_name y items desde el JSON
    const obraName = obra_name || 'Nombre_Desconocido'; // Asignar un valor predeterminado si obra_name es undefined o null
    const nroPedido = pedido.data.nroPedido || 'Desconocido'; // Si no hay nroPedido, asignar 'Desconocido'

    const outputDir = path.join(__dirname, 'Impresos');
    console.log("Trato de hacer la conformidad");

    // Crear el directorio 'Impresos' si no existe
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Definir el nombre completo del archivo PDF
    const filePath = path.join(outputDir, `Conformidad_${obraName.replace(/\s+/g, '_')}_Pedido_${nroPedido}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
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
        doc.text(`${index + 1}. ${item.producto_name}`, 50, doc.y, { width: 300 });
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
        await enviarPDFWhatsApp(sock, userId, filePath);
    });

    return filePath;
}

// Función para enviar el PDF por WhatsApp
async function enviarPDFWhatsApp(sock, recipient, filePath) {
    try {
        const pdfBuffer = fs.readFileSync(filePath); // Lee el archivo PDF

        // Enviar el archivo PDF al usuario
        await sock.sendMessage(recipient, {
            document: pdfBuffer,  // El documento que se va a enviar
            mimetype: 'application/pdf',  // Tipo MIME para el archivo PDF
            fileName: path.basename(filePath)  // Nombre del archivo (puedes extraerlo si lo deseas)
        });

        console.log(`PDF enviado a ${recipient}`);
    } catch (error) {
        console.error("Error enviando el PDF:", error);
    }
}
