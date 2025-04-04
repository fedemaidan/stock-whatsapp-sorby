const calcularStock = require('../EgresoMateriales/CalcularStock');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const { Obra } = require('../../../models');

module.exports = async function obtenerDisponibilidad(obra_id, items) {
    let sePuedeDesdeObraPrincipal = true;
    const obrasDetalle = {};
    const aportesPorObra = {};

    for (const item of items) {
        const stockPrincipal = await calcularStock(item.producto_id, obra_id);

        if (!obrasDetalle[obra_id]) obrasDetalle[obra_id] = { id: obra_id, productos: [] };

        if (stockPrincipal >= item.cantidad) {
            obrasDetalle[obra_id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: item.cantidad
            });
            continue;
        } else {
            sePuedeDesdeObraPrincipal = false;
            let cantidadRestante = item.cantidad - stockPrincipal;

            if (stockPrincipal > 0) {
                obrasDetalle[obra_id].productos.push({
                    id: item.producto_id,
                    nombre: item.producto_name,
                    cantidad: stockPrincipal
                });
            }

            const obrasConStock = await obtenerObrasConStock(item.producto_id);
            let mejorObra = null;
            let mejorCantidad = 0;

            for (const obra of obrasConStock) {
                if (obra.obra_id == obra_id) continue; // omitimos la principal

                const stockDisponible = await calcularStock(item.producto_id, obra.obra_id);
                if (stockDisponible > mejorCantidad) {
                    mejorCantidad = stockDisponible;
                    mejorObra = obra;
                }
            }

            if (mejorObra && mejorCantidad > 0) {
                const cantidadAportada = Math.min(mejorCantidad, cantidadRestante);
                cantidadRestante -= cantidadAportada;

                if (!obrasDetalle[mejorObra.obra_id]) {
                    obrasDetalle[mejorObra.obra_id] = { id: mejorObra.obra_id, productos: [] };
                }

                obrasDetalle[mejorObra.obra_id].productos.push({
                    id: item.producto_id,
                    nombre: item.producto_name,
                    cantidad: cantidadAportada
                });

                if (!aportesPorObra[mejorObra.obra_id]) aportesPorObra[mejorObra.obra_id] = 0;
                aportesPorObra[mejorObra.obra_id] += cantidadAportada;

                if (cantidadRestante > 0) {
                    return {
                        Success: "No stock",
                        msg: "Ninguna obra tiene la posibilidad de suplir el pedido.",
                        ListaObras: obrasDetalle
                    };
                }
            } else {
                return {
                    Success: "No stock",
                    msg: "Ninguna obra tiene la posibilidad de suplir el pedido.",
                    ListaObras: obrasDetalle
                };
            }
        }
    }

    // Obtener los nombres de las obras
    const idsObras = Object.keys(obrasDetalle);
    const obrasInfo = await Obra.findAll({
        where: { id: idsObras },
        attributes: ['id', 'nombre']
    });

    obrasInfo.forEach(obra => {
        obrasDetalle[obra.id].nombre = obra.nombre;
    });

    if (sePuedeDesdeObraPrincipal) {
        return {
            Success: "Hay stock",
            msg: "La obra principal tiene suficiente stock para cubrir el pedido.",
            ListaObras: obrasDetalle
        };
    }

    let mensaje = `📦 El pedido no puede ser cubierto únicamente por la obra principal, pero puede completarse con apoyo de una sola obra adicional:\n\n`;
    for (const [obraId, detalle] of Object.entries(obrasDetalle)) {
        mensaje += `🏗️ *${detalle.nombre}*\n`;
        detalle.productos.forEach(p => {
            mensaje += `   - ${p.nombre}: ${p.cantidad} unidades\n`;
        });
        mensaje += '\n';
    }

    return {
        Success: "Otras obras",
        msg: mensaje,
        ListaObras: obrasDetalle
    };
};
