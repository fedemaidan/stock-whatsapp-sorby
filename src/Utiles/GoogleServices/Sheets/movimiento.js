const { addRow, updateRow, updateSheetWithBatchDelete } = require('../General');
const { Material, Movimiento, Obra, Pedido } = require('../../../models');  // Importa los modelos necesarios
const general_range = 'MovimientoRAW!A1:Z1000';

async function getArrayToSheetGeneral(movimiento) {
    const material = await Material.findOne({ where: { id: movimiento.id_material } });
    const obraOrigen = await Obra.findOne({ where: { id: movimiento.cod_obra_origen } });
    const obraDestino = movimiento.cod_obradestino ? await Obra.findOne({ where: { id: movimiento.cod_obradestino } }) : null;

    // Determinar el tipo de movimiento
    let tipoMovimiento = "Ingreso";
    if (!movimiento.tipo) {
        tipoMovimiento = obraDestino ? "Transferencia" : "Egreso";
    }

    // Calcular saldo según el tipo de movimiento
    let saldo = movimiento.cantidad; // Por defecto positivo
    if (tipoMovimiento === "Egreso" || tipoMovimiento === "Transferencia") {
        saldo = -movimiento.cantidad; // Negativo para egresos y transferencias
    }

    // Preparar los valores para la hoja de cálculo
    const values = [
        movimiento.id,
        movimiento.fecha,
        material ? material.nombre : 'Desconocido',
        material ? material.id : movimiento.id_material,  // Si no encontramos el material, ponemos el ID
        material.SKU,
        obraOrigen.id,
        obraOrigen ? obraOrigen.nombre : 'Desconocido',
        obraDestino ? obraDestino.id : 'No Aplica',
        obraDestino ? obraDestino.nombre : 'No Aplica',
        movimiento.cantidad,
        saldo,  // Agregado saldo calculado
        tipoMovimiento,  // Tipo modificado según la lógica
        movimiento.nro_compra || "",
        movimiento.nro_pedido || "",
        movimiento.estado,
        "ACTIVE"  // Estado para el registro en Sheets
    ];
    return values;
}


function getTitlesToSheetGeneral() {
    return [
        "ID",
        "Fecha",
        "Nombre Material",
        "ID Material",
        "Código Obra Origen",
        "Código Obra Destino",
        "Cantidad",
        "Tipo",
        "Nro Compra",
        "Nro Pedido",
        "Estado",
        "Status"
    ];
}

async function addMovimientoToSheetWithClientGeneral(movimiento, proyecto) {
    const values = await getArrayToSheetGeneral(movimiento);
    console.log("EN GOOGLE SHEET ♥♥♣♦♦◘")
    console.log(values)
    await addRow(proyecto.sheetWithClient, values, general_range);
}

async function editMovimientoToSheetWithClientGeneral(movimiento, proyecto) {
    const values = await getArrayToSheetGeneral(movimiento);
    console.log("movimiento ID: ß▬5")
    console.log(values)
    await updateRow(proyecto.sheetWithClient, values, general_range, 0, movimiento.id);
}

async function deleteMovimientoToSheetWithClientGeneral(movimiento, proyecto) {
    let values = await getArrayToSheetGeneral(movimiento);
    values = values.map(value => value === "ACTIVE" ? "DELETED" : value);
    await updateRow(proyecto.sheetWithClient, values, general_range, 0, movimiento.id);
}

module.exports = {
    addMovimientoToSheetWithClientGeneral,
    editMovimientoToSheetWithClientGeneral,
    deleteMovimientoToSheetWithClientGeneral
};
