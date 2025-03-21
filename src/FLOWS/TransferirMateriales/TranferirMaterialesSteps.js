const CrearTransferencia = require('../TransferirMateriales/STEPS/CrearTransferencia');
const ModificarTransferencia = require('../TransferirMateriales/STEPS/ModificarTransferencia');
const ConfirmarOModificarTransferencia = require('../TransferirMateriales/STEPS/ConfirmarOModificarTransferencia');

const TranferirMaterialesSteps =
{
    CrearTransferencia,
    ModificarTransferencia,
    ConfirmarOModificarTransferencia
}
module.exports = { TranferirMaterialesSteps };