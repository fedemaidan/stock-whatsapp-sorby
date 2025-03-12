const { addRow, updateRow, updateSheetWithBatchDelete } = require('../General');
const { Material, Movimiento, Obra, Pedido } = require('../../../models');  // Importa los modelos necesarios
const general_range = 'Pedidos!A1:Z1000';

async function getArrayToSheetGeneral(pedido) {
    // Preparar los valores tangibles para la hoja de cálculo
    const values = [
        pedido.id,
        pedido.fecha,
        pedido.aclaracion,
        pedido.estado,
        pedido.url_remito,
        "ACTIVE"  // Estado para el registro en Sheets
    ];
    return values;
}

function getTitlesToSheetGeneral() {
    return [
        "ID",
        "Fecha",
        "Aclaracion",
        "Estado",
        "URL"
    ];
}

async function addPedidoToSheetWithClientGeneral(pedido, proyecto) {
    const values = await getArrayToSheetGeneral(pedido);
    console.log("EN GOOGLE SHEET ♥♥♣♦♦◘")
    console.log(values)
    await addRow(proyecto.sheetWithClient, values, general_range);
}

async function editPedidoToSheetWithClientGeneral(pedido, proyecto) {
    const values = await getArrayToSheetGeneral(pedido);
    console.log("PEDIDO ID: ß▬5")
    console.log(values)
    await updateRow(proyecto.sheetWithClient, values, general_range, 0, pedido.id);
}

async function deletePedidoToSheetWithClientGeneral(pedido, proyecto) {
    let values = await getArrayToSheetGeneral(pedido);
    values = values.map(value => value === "ACTIVE" ? "DELETED" : value);
    await updateRow(proyecto.sheetWithClient, values, general_range, 0, pedido.id);
}

module.exports = {
    addPedidoToSheetWithClientGeneral,
    editPedidoToSheetWithClientGeneral,
    deletePedidoToSheetWithClientGeneral
};
