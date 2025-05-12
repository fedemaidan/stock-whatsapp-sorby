const { getByChatGpt4o } = require("../Base");

async function opciondevMateriales(message, jsonCompleto) {
    const prompt = `
Sos un bot que gestiona devoluciones de materiales en un sistema de stock.

Objetivo:
Interpretar qué materiales el usuario quiere devolver a partir de un mensaje de texto y validar esa información comparándola con un pedido original.

Instrucciones:
1. El mensaje del usuario contiene nombres de materiales y cantidades (ej: "Cemento 5, Arena 10").
2. Verificá que los materiales mencionados existan en el campo "pedidoOriginal".
3. Verificá que las cantidades indicadas para devolución no superen lo que se entregó en el pedido original.
4. Solo incluí en el array "devolucion[]" los materiales válidos que cumplan los criterios.
5. NO agregues materiales que no estén en el pedido original.
6. El campo "devolucion" debe contener objetos con: "materialId", "nombre", "cantidad".
7. No incluyas texto explicativo ni comentarios: devolvé EXCLUSIVAMENTE el JSON resultante, actualizado.

Mensaje del usuario:
"${message}"

Estructura del JSON:
${JSON.stringify(jsonCompleto, null, 2)}

Respondé exclusivamente con el JSON modificado (sin texto extra):
`;

    const response = await getByChatGpt4o(prompt);
    const parsed = JSON.parse(response);

    if (parsed.hasOwnProperty('json_data')) {
        return parsed.json_data;
    } else {
        return parsed;
    }
}

module.exports = opciondevMateriales;
