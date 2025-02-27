const CrearIngreso = require("../IngresoDeMateriales/STEPS/CrearIngreso");
const ConfirmarOModificarIngreso = require("../IngresoDeMateriales/STEPS/ConfirmarOModificarIngreso");
const ModificarIngreso = require("../IngresoDeMateriales/STEPS/ModificarIngreso");

const IngresoMaterialSteps =
{
    CrearIngreso,
    ConfirmarOModificarIngreso,
    ModificarIngreso
}
module.exports = { IngresoMaterialSteps };