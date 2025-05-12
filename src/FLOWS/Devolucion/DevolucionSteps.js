const iNiciarDevolucion = require('../Devolucion/Steps/iNiciarDevolucion');
const AsignarOrigenDevolucion = require('../Devolucion/Steps/AsignarOrigenDevolucion');
const validarDevolucion = require('../Devolucion/Steps/validarDevolucion');

const DevolucionSteps =
{
    iNiciarDevolucion,
    AsignarOrigenDevolucion,
    validarDevolucion
}
module.exports = { DevolucionSteps };