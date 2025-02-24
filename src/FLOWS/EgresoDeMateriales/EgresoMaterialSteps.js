const ConfirmarOModificarEgreso = require('../EgresoDeMateriales/STEPS/ConfirmarOModificarEgreso');
const CrearEgreso = require('../EgresoDeMateriales/STEPS/CrearEgreso');
const ModificarPedido = require('../EgresoDeMateriales/STEPS/ModificarPedido');


const EgresoMaterialSteps =
{ 
    CrearEgreso,
    ConfirmarOModificarEgreso,
    ModificarPedido,
}
module.exports = {EgresoMaterialSteps};