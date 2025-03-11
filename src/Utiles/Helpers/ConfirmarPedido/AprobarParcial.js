const FlowManager = require('../../../FlowControl/FlowManager');
const { Pedido, Movimiento, Material, Obra } = require('../../../models');

module.exports = async function AprobarParcial(userId) {
    try {
        const flowData = FlowManager.userFlows[userId]?.flowData;
        console.log("📌 FlowData recibido:", flowData);

        if (!flowData || !flowData.Nro_Pedido) {
            return { Success: false, msg: '❌ No se encontró información del pedido en FlowManager.' };
        }

        let { Nro_Pedido, aclaracion, aprobados, rechazados } = flowData;
        console.log(`📌 Procesando pedido #${Nro_Pedido}`);
        console.log("📌 Aprobados:", aprobados);
        console.log("📌 Rechazados:", rechazados);

        await Pedido.update(
            {
                estado: 'Aprobado Parcial',
                aclaracion: aclaracion
            },
            { where: { id: Nro_Pedido } }
        );

        for (const mov of aprobados) {
            console.log(`✅ Aprobando producto: ${mov.producto_name}`);

            const obraOrigen = await Obra.findOne({ where: { nombre: mov.obra_origen } });
            if (!obraOrigen) {
                return { Success: false, msg: `❌ No se encontró la obra de origen ${mov.obra_origen}` };
            }

            const movimiento = await Movimiento.findOne({
                where: {
                    nro_pedido: Nro_Pedido,
                    nombre: mov.producto_name,
                    cod_obra_origen: obraOrigen.id
                }
            });

            if (!movimiento) {
                return { Success: false, msg: `❌ No se encontró el movimiento ${mov.producto_name}` };
            }

            await Movimiento.update(
                { estado: 'Aprobado', cantidad: mov.cantidad },
                { where: { id: movimiento.id } }
            );

            const movActualizado = await Movimiento.findOne({ where: { id: movimiento.id } });
            console.log("✔ Movimiento actualizado:", movActualizado);
        }

        for (const mov of rechazados) {
            console.log(`❌ Rechazando producto: ${mov.producto_name}`);

            const obraOrigen = await Obra.findOne({ where: { nombre: mov.obra_origen } });
            if (!obraOrigen) {
                return { Success: false, msg: `❌ No se encontró la obra de origen ${mov.obra_origen}` };
            }

            const movimiento = await Movimiento.findOne({
                where: {
                    nro_pedido: Nro_Pedido,
                    nombre: mov.producto_name,
                    cod_obra_origen: obraOrigen.id
                }
            });

            if (!movimiento) {
                return { Success: false, msg: `❌ No se encontró el movimiento ${mov.producto_name}` };
            }

            // 🚀 Crear un nuevo movimiento con estado "Rechazado"
            console.log(`🔄 Creando movimiento "Rechazado" para ${mov.producto_name}`);
            await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: movimiento.id_material,
                cod_obra_origen: obraOrigen.id,
                cod_obradestino: movimiento.cod_obradestino,
                cantidad: mov.cantidad,
                tipo: false, // Egreso
                nro_pedido: Nro_Pedido,
                estado: 'Rechazado'
            });

            console.log(`✅ Movimiento rechazado creado para ${mov.producto_name}`);

            // 🔄 Crear la "Devolución por rechazo"
            const material = await Material.findOne({ where: { nombre: mov.producto_name } });
            if (!material) {
                return { Success: false, msg: `❌ No se encontró el material ${mov.producto_name}` };
            }

            let obraDestinoId = obraOrigen.id;
            if (mov.obra_destino) {
                const obraDestinoRecord = await Obra.findOne({ where: { nombre: mov.obra_destino } });
                if (obraDestinoRecord) {
                    obraDestinoId = obraDestinoRecord.id;
                }
            }

            console.log(`🔄 Creando "Devolución por rechazo" para ${mov.producto_name}`);
            await Movimiento.create({
                fecha: obtenerFecha(),
                nombre: mov.producto_name,
                id_material: material.id,
                cod_obra_origen: obraDestinoId,
                cod_obradestino: obraOrigen.id,
                cantidad: mov.cantidad,
                tipo: true, // Ingreso
                nro_pedido: Nro_Pedido,
                estado: 'Devolución por rechazo'
            });

            console.log(`✅ Devolución creada para ${mov.producto_name}`);
        }


        return { Success: true, msg: '✅ Pedido aprobado parcialmente y productos rechazados devueltos correctamente.' };
    } catch (error) {
        console.error(`❌ Error en AprobarParcial: ${error.message}`);
        return { Success: false, msg: `❌ Error al aprobar parcialmente el pedido: ${error.message}` };
    }
}

const obtenerFecha = () => new Date();
