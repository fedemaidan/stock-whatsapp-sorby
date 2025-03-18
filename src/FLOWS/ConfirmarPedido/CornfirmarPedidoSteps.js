const CrearConfirmacion = require('../ConfirmarPedido/STEPS/CrearConfirmacion');
const RecepcionParcial = require('../ConfirmarPedido/STEPS/RecepcionParcial');
const SeleccionarOpcion = require('../ConfirmarPedido/STEPS/SeleccionarOpcion');
const ConfirmarOpcion = require('../ConfirmarPedido/STEPS/ConfirmarOpcion');

const CornfirmarPedidoSteps =
{
    CrearConfirmacion,
    RecepcionParcial,
    SeleccionarOpcion,
    ConfirmarOpcion
}
module.exports = { CornfirmarPedidoSteps };