const CrearConfirmacion = require('../ConfirmarPedido/STEPS/CrearConfirmacion');
const RecepcionParcial = require('../ConfirmarPedido/STEPS/RecepcionParcial');
const SeleccionarOpcion = require('../ConfirmarPedido/STEPS/SeleccionarOpcion');
const ConfirmarOpcion = require('../ConfirmarPedido/STEPS/ConfirmarOpcion');
const RepetirCrearConfirmacion = require('../ConfirmarPedido/STEPS/RepetirCrearConfirmacion');

const CornfirmarPedidoSteps =
{
    CrearConfirmacion,
    RecepcionParcial,
    SeleccionarOpcion,
    ConfirmarOpcion,
    RepetirCrearConfirmacion
}
module.exports = { CornfirmarPedidoSteps };