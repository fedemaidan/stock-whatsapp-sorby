const CrearConfirmacion = require('../ConfirmarPedido/STEPS/CrearConfirmacion');
const RecepcionParcial = require('../ConfirmarPedido/STEPS/RecepcionParcial');
const SeleccionarOpcion = require('../ConfirmarPedido/STEPS/SeleccionarOpcion');


const CornfirmarPedidoSteps =
{
    CrearConfirmacion,
    RecepcionParcial,
    SeleccionarOpcion
}
module.exports = { CornfirmarPedidoSteps };