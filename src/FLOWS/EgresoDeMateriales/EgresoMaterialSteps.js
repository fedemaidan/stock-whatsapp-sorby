const ConfirmarOModificarEgreso = require('../EgresoDeMateriales/STEPS/ConfirmarOModificarEgreso');
const CrearEgreso = require('../EgresoDeMateriales/STEPS/CrearEgreso');
const ModificarPedido = require('../EgresoDeMateriales/STEPS/ModificarPedido');
const RetirarEgresoFiltrado = require('../EgresoDeMateriales/STEPS/RetirarEgresoFiltrado');

const EgresoMaterialSteps =
{ 
    CrearEgreso,
    ConfirmarOModificarEgreso,
    ModificarPedido,
    RetirarEgresoFiltrado
}
module.exports = {EgresoMaterialSteps};