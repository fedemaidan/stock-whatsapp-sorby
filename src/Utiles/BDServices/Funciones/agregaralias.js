async function fusionarAlias(aliasViejos, aliasNuevos) {
    const set = new Set([...(aliasViejos || []), ...aliasNuevos]);
    return Array.from(set);
}

async function agregarAlias(material, aliasArray) {
    try {
        const aliasCombinados = await fusionarAlias(material.alias, aliasArray);
        await material.update({
            alias: aliasCombinados
        });
        console.log(`Alias fusionados para material ID ${material.id}`);
    } catch (error) {
        console.error(`Error al guardar alias para material ID ${material.id}:`, error);
    }
}

module.exports = {
    agregarAlias,
    fusionarAlias
};