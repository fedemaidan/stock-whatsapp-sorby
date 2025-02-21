const FlowManager = require('../../FlowControl/FlowManager')
const analizarIntencion = require('../../Utiles/Chatgpt/ChatGpt');

const EgresoMaterialSteps =
{ 
 async CrearEgreso(userId, data, sock)
{
     const { obra_id, obra_name, items } = data.data;

     // Creamos un string con la información de la obra
     let output = `Información de la Obra:\nNombre: ${obra_name}\n\nProductos:\n`;

     // Recorremos el array de productos y vamos agregando su información al string
     items.forEach(item => {
         output += `Nombre: ${item.producto_name}, Cantidad: ${item.cantidad}\n`;
     });
     //console.log(output);


     await sock.sendMessage(userId, { text: output });
     await sock.sendMessage(userId, { text: "Desea confirmar el pedido ? \n1.SI\n2.NO" });
    //userId, flowName, initialStep = 0, flowData = {}//
    FlowManager.setFlow(userId, "EGRESOMATERIALES","ConfirmarOModificarEgreso", data)
},

 async ConfirmarOModificarEgreso(userId, data, sock) {
     console.log("00000000000000000000000000000000000000000000000000000000000000000000000000000000")
     console.log(data)
     console.log("00000000000000000000000000000000000000000000000000000000000000000000000000000000")
    if (data.data == "1")
    {
        await sock.sendMessage(userId, { text: "Continuando..." });
        await sock.sendMessage(userId, { text: "PEDIDO TERMINADO" });
        FlowManager.resetFlow(userId)
    }
    else
    {
        await sock.sendMessage(userId, { text: "Ingrese los cambios a efectuar en el PEDIDO" });
        FlowManager.setFlow(userId, "EGRESOMATERIALES", "ModificarPedido", data)
    }
},

  async ModificarPedido(userId, data, sock)
{
     const { obra_id, obra_name, items } = data.data;

     // Creamos un string con la información de la obra
     let output = `Información de la Obra:\nNombre: ${obra_name}\n\nProductos:\n`;

     // Recorremos el array de productos y vamos agregando su información al string
     items.forEach(item => {
         output += `Nombre: ${item.producto_name}, Cantidad: ${item.cantidad}\n`;
     });
     //console.log(output);

     await sock.sendMessage(userId, { text: output });
     await sock.sendMessage(userId, { text: "Desea confirmar el pedido ? \n1.SI\n2.NO" });
    //userId, flowName, initialStep = 0, flowData = {}//
    FlowManager.setFlow(userId, "EGRESOMATERIALES", "ConfirmarOModificarEgreso", data)
},

}
module.exports = {EgresoMaterialSteps};