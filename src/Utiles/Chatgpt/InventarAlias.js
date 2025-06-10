const { getByChatGpt4o } = require("../Base");
const { Material } = require('../../models');
const agregarAlias = require('./agregarAlias'); // Asegurate que este sea el path correcto

async function InventarAlias(material) {
    const prompt = `
Sos un asistente de stock para electricistas en Argentina.

Tu tarea es inventar hasta 5 alias comunes o coloquiales que un electricista argentino podría usar para referirse a un material dado. Los alias pueden incluir abreviaciones, nombres genéricos, errores comunes, jerga o nombres más simples.

Requisitos:
- Devolver un JSON con una clave "alias" que contenga un array de strings.
- No expliques nada. Solo devolvé el JSON válido.
- Si se te ocurren menos de 5 alias, repetí algunos. Pero el array debe tener 5 elementos sí o sí.

Material:
- Nombre: ${material.nombre}
- Marca: ${material.marca || "Desconocida"}
- Producto: ${material.producto || "Desconocido"}
- Rubro: ${material.rubro || "Desconocido"}

Ejemplo de respuesta válida:
{
  "alias": ["termica", "disyuntor chico", "abby term", "termi 2x16", "protección eléctrica"]
}
`;

    try {
        const response = await getByChatGpt4o(prompt);
        const parsed = JSON.parse(response);

        if (parsed.alias && Array.isArray(parsed.alias)) {
            await agregarAlias(material, parsed.alias);
            return parsed.alias;
        } else {
            console.warn("Respuesta sin alias válidos:", response);
            return [];
        }
    } catch (error) {
        console.error("Error generando alias:", error);
        return [];
    }
}

module.exports = InventarAlias;