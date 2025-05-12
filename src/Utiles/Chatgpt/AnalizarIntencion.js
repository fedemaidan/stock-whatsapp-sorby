const { getByChatGpt4o } = require("./Base");
const { obtenerTodosLosMateriales } = require('../BDServices/Funciones/FuncionesMaterial');
const {obtenerTodasLasObras } = require('../BDServices/Funciones/FuncionesObra');
const FlowManager = require('../../FlowControl/FlowManager')

const opciones = [
    {
        accion: "Crear Egreso",
        data:
        {
            obra_id: "Id de la obra",
            obra_name: "El nombre de la obra / identificacion hacia donde iran los materiales",
            items:
            [
                {
                    producto_id: "id del producto al que me estoy refiriendo",
                    producto_name: "nombre del producto al que me estoy refiriendo",
                    cantidad: "Cantidad de este material indicado",
                    SKU: "El codigo interno del deposito",
                    zona: "ubicacion, en que zona del deposito se encuentra el material."
                },
            ]
        }
    }, 
    {
        accion: "Crear Ingreso",
        data:
        {
            obra_id: "El id de la obra a la que se refiere en caso de no referise a una obra dentro del mensaje pon 0",
            obra_name:"Aqui va la obra a la que iran asignado los materiales en caso de no especificarla en el mensaje solo pon FlyDac",
            nro_compra: "Aqui va el numero del remito o factura en caso de no haber ingresado nada el usuario referiendose a este mismo simplemente poner 00000",
            items:
            [
                {
                    producto_id: "id del producto al que me estoy refiriendo// en caso de no encontrar el material en la base de datos dejarlo en 0",
                    producto_name: "nombre del producto al que me estoy refiriendo // en caso de no encontrar el material en la base de datos dejarlo en como el mensaje del usuario",
                    cantidad: "Cantidad de este material indicado",
                    SKU: "El codigo interno del deposito",
                    zona: "ubicacion, en que zona del deposito se encuentra el material."
                },
            ]
        }
    },
    {
        accion: "Crear Confirmacion",
        info: "Aqui se debe crear la confirmacion de un pedido de retiro",
        data:
        {
            Nro_Pedido: "aqui va el numero de pedido dado por el usuario",
        }
    },
    {
        accion: "Aprobar Parcial",
        info: "Aqui se debe aprobar parcialmente un pedido de retiro",
        data:
        {
            Nro_Pedido: "aqui va el numero de pedido dado por el usuario",
        }
    },
    {
        accion: "Rechazar",
        info: "Aqui se debe rechazar un pedido de retiro",
        data:
        {
            Nro_Pedido: "aqui va el numero de pedido dado por el usuario",
        }
    },
    {
        accion: "Consultar Pedido",
        info: "Aqui se debe consultar un pedido de retiro o hacer referencia a uno y su informacion",
        data:
        {
            Nro_Pedido: "aqui va el numero de pedido dado por el usuario",
        }
    },
    {
        accion: "Tranfererir Materiales",
        info: "Aqui se debe transferir materiales de una obra hacia otra",
        data:
        {
            obra_id_origen: "El id de la obra de origen a la que se refiere en caso de no referise a una obra dentro del mensaje pon 0",
            obra_name_origen: "Aqui va la obra de origen a la que iran asignado los materiales en caso de no especificarla en el mensaje solo pon FlyDac",
            obra_id_destino: "El id de la obra de destino a la que se refiere en caso de no referise a una obra dentro del mensaje pon 0",
            obra_name_destino: "Aqui va la obra de destino a la que iran asignado los materiales en caso de no especificarla en el mensaje solo pon FlyDac",
            items:
                [
                    {
                        producto_id: "id del producto al que me estoy refiriendo",
                        producto_name: "nombre del producto al que me estoy refiriendo",
                        cantidad: "Cantidad de este material indicado",
                        SKU: "El codigo interno del deposito",
                        zona: "ubicacion, en que zona del deposito se encuentra el material."
                    },
                ]
        }
    },
    {
        accion: "Consultar Stock",
        info: "Aqui se debe consultar un material del stock listar las obras y cuanto de este material disponen y su informacion",
        data:
        {
            id_material: "aqui va el id de material dado por el usuario",
        }
    },
    {
        accion: "Consultar Stock por obra",
        info: "Aqui se debe consultar una obra y cuanto material disponen y su informacion",
        data:
        {
            id_obra: "aqui va el id de material dado por el usuario",
        }
    },
    {
        accion: "devolucion",
        info: "Se busca realizar una devolucion de materiales, y para ello el usuario suministra el numero de remito o pedido.",
        data:
        {
        pedidoID: "numero de pedido o remito dado por el usuario",
        pedidoOriginal: [],
        devolucion: 
        [
            {
      materialId: 1,
      nombre: "ejemplo",
      cantidad: 5,
      origen: "Obra A"
    },
    {
      materialId: 2,
      nombre: "Arena",
      cantidad: 30,
      origen: "Obra B"
    }
    ],
    skipObraIntro: false
   }
},

    {
        accion: "No comprendido",
        data:
        {
            Default: "No se comprendio el mensaje o es demasiado ambiguo en sus peticiones.",
        }
    },
    {
        accion: "Ayuda",
        data:
        {
            Default: "El usuario quiere ayuda sobre que comandos tiene disponible.",
        }
    }
];

// Servicio para analizar la intención del mensaje
const analizarIntencion = async (message, sender) => {
    try
    {
        const materiales = await obtenerTodosLosMateriales();
        const Obras = await obtenerTodasLasObras()
  
        const opcionesTxt = JSON.stringify(opciones);
        prompt = `
Como Capataz experto en obras, materiales de contruccion y depositos de materiales de construccion, quiero que identifiques la intención del usuario capataz  de obra y ejecutar la acción adecuada para gestionar correctamente las operaciones posibles.

Formato de respuesta: Devuelve únicamente un JSON con los datos cargados, sin incluir explicaciones adicionales.

Advertencia: Revisa cuidadosamente el mensaje del usuario y asegúrate extraer el o los materiales mas coincidente con todos los detalles del material solicitado, como tamaño, color y tipo de material.

Reglas (estas reglas aplican siempre que se maneje un material):
1. Si el usuario proporciona características específicas (como "2,5mm", "celeste", "tamaño 3/4"), debo garantizar que la selección sea precisa.
2. Si el usuario no proporciona caracteristicas especificas retornar el mas similar.

El usuario dice: "${message}"

Tienes estas acciones posibles debes analizar la palabra clave del usuario tanto si quiere retirar algo del stock o ingresarlo: ${opcionesTxt}.

Aquí está el stock disponible:
${JSON.stringify(materiales, null, 2)}
Aqui estan las obras disponibles:
${JSON.stringify(Obras, null, 2)}
`;
        const response = await getByChatGpt4o(prompt);
        const respuesta = JSON.parse(response);

        if (respuesta.hasOwnProperty('json_data'))
        {
            return respuesta.json_data
        }
        else
        {
            return respuesta
        }
    } catch (error) {
        console.error('Error al analizar la intención:', error.message);
        return 'desconocido'; // Intención predeterminada en caso de error
    }
};

module.exports = { analizarIntencion };
