const calcularStock = require('../EgresoMateriales/CalcularStock');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const { Obra } = require('../../../models');

module.exports = async function obtenerDisponibilidad(obra_id, items) {
    const obrasDetalle = {};
    const productosFaltantes = [];
    const pedido_final = [];

    for (const item of items) {
        const stockPrincipal = await calcularStock(item.producto_id, obra_id);

        // Si tiene stock suficiente la obra que hace el pedido
        if (stockPrincipal >= item.cantidad) {
            if (!obrasDetalle[obra_id]) {
                obrasDetalle[obra_id] = { id: obra_id, productos: [] };
            }

            obrasDetalle[obra_id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: item.cantidad
            });

            pedido_final.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidadTotal: item.cantidad,
                obrasSeleccionadas: [{
                    id: obra_id,
                    nombre: "", // Se completa más abajo
                    stockRequerido: item.cantidad
                }]
            });

            continue; // Pasamos al siguiente producto
        }

        // Si NO tiene suficiente stock la obra que hace el pedido
        const obrasConStock = await obtenerObrasConStock(item.producto_id);
        const opcionesDeObras = [];

        for (const obra of obrasConStock) {
            if (obra.obra_id == obra_id) continue;

            opcionesDeObras.push({
                id: obra.obra_id,
                nombre: obra.obra_name,
                stockDisponible: obra.stock
            });
        }

        // Si no hay ninguna obra que tenga stock suficiente para ayudar
        if (opcionesDeObras.length === 0) {
            productosFaltantes.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidadFaltante: item.cantidad,
                opcionesObras: []
            });

            return {
                Success: "No stock",
                msg: "Ninguna obra tiene la posibilidad de suplir el pedido.",
                ListaObras: obrasDetalle,
                ProductosFaltantes: productosFaltantes,
                pedido_final
            };
        }

        // Hay al menos una obra que puede ayudar, agregamos a faltantes
        productosFaltantes.push({
            id: item.producto_id,
            nombre: item.producto_name,
            cantidadFaltante: item.cantidad,
            opcionesObras: opcionesDeObras
        });

        // También agregamos a pedido_final, pero sin decisión de obra todavía
        pedido_final.push({
            id: item.producto_id,
            nombre: item.producto_name,
            cantidadTotal: item.cantidad,
            obrasSeleccionadas: opcionesDeObras.map(obra => ({
                id: obra.id,
                nombre: obra.nombre,
                stockRequerido: 0 // A definir en la elección
            }))
        });
    }

    // Completar nombres de las obras en obrasDetalle
    const idsObras = Object.keys(obrasDetalle);
    const obrasInfo = await Obra.findAll({
        where: { id: idsObras },
        attributes: ['id', 'nombre']
    });

    obrasInfo.forEach(obra => {
        obrasDetalle[obra.id].nombre = obra.nombre;
    });

    // Completar los nombres en pedido_final
    for (const producto of pedido_final) {
        producto.obrasSeleccionadas.forEach(ob => {
            ob.nombre = obrasDetalle[ob.id]?.nombre || ob.nombre || "Obra desconocida";
        });
    }

    if (productosFaltantes.length === 0) {
        return {
            Success: "Hay stock",
            msg: "La obra principal tiene suficiente stock para cubrir el pedido.",
            ListaObras: obrasDetalle,
            ProductosFaltantes: [],
            pedido_final
        };
    }

    return {
        Success: "Otras obras",
        msg: "Hay productos que requieren apoyo de otras obras.",
        ListaObras: obrasDetalle,
        ProductosFaltantes: productosFaltantes,
        pedido_final
    };
};




/* version 3 continua el error hay stock
const calcularStock = require('../EgresoMateriales/CalcularStock');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const { Obra } = require('../../../models');

module.exports = async function obtenerDisponibilidad(obra_id, items) {
    const obrasDetalle = {};
    const productosFaltantes = [];
    const pedido_final = [];

    for (const item of items) {
        const stockPrincipal = await calcularStock(item.producto_id, obra_id);
        let cantidadRestante = item.cantidad - stockPrincipal;

        const pedidoTemporal = {
            id: item.producto_id,
            nombre: item.producto_name,
            cantidadTotal: item.cantidad,
            obrasSeleccionadas: []
        };

        if (!obrasDetalle[obra_id]) {
            obrasDetalle[obra_id] = { id: obra_id, productos: [] };
        }

        if (stockPrincipal > 0) {
            pedidoTemporal.obrasSeleccionadas.push({
                id: obra_id,
                nombre: "",
                stockRequerido: stockPrincipal
            });

            obrasDetalle[obra_id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: stockPrincipal
            });
        }

        if (cantidadRestante <= 0) {
            pedido_final.push(pedidoTemporal);
            continue;
        }

        const obrasConStock = await obtenerObrasConStock(item.producto_id);
        const opcionesDeObras = [];

        for (const obra of obrasConStock) {
            if (obra.obra_id == obra_id) continue;
            opcionesDeObras.push({
                id: obra.obra_id,
                nombre: obra.obra_name,
                stockDisponible: obra.stock
            });
        }

        opcionesDeObras.sort((a, b) => b.stockDisponible - a.stockDisponible);

        for (const obra of opcionesDeObras) {
            if (cantidadRestante <= 0) break;

            const cantidadAportada = Math.min(obra.stockDisponible, cantidadRestante);
            cantidadRestante -= cantidadAportada;

            pedidoTemporal.obrasSeleccionadas.push({
                id: obra.id,
                nombre: obra.nombre,
                stockRequerido: cantidadAportada
            });

            if (!obrasDetalle[obra.id]) {
                obrasDetalle[obra.id] = { id: obra.id, productos: [] };
            }

            obrasDetalle[obra.id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: cantidadAportada
            });
        }

        if (cantidadRestante === 0) {
            pedido_final.push(pedidoTemporal);
        } else {
            productosFaltantes.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidadFaltante: cantidadRestante,
                opcionesObras: opcionesDeObras
            });
        }
    }

    const idsObras = Object.keys(obrasDetalle);
    const obrasInfo = await Obra.findAll({
        where: { id: idsObras },
        attributes: ['id', 'nombre']
    });

    obrasInfo.forEach(obra => {
        obrasDetalle[obra.id].nombre = obra.nombre;
    });

    for (const producto of pedido_final) {
        producto.obrasSeleccionadas.forEach(ob => {
            ob.nombre = obrasDetalle[ob.id]?.nombre || "Obra desconocida";
        });
    }

    if (productosFaltantes.length === 0) {
        return {
            Success: "Hay stock",
            msg: "La obra principal (o con apoyo) tiene suficiente stock para cubrir el pedido.",
            ListaObras: obrasDetalle,
            ProductosFaltantes: [],
            pedido_final
        };
    }

    const hayOpciones = productosFaltantes.some(f => f.opcionesObras.length > 0);

    if (hayOpciones) {
        return {
            Success: "Otras obras",
            msg: "Existen otras obras que pueden apoyar con stock.",
            ListaObras: obrasDetalle,
            ProductosFaltantes: productosFaltantes,
            pedido_final
        };
    } else {
        return {
            Success: "No stock",
            msg: "No hay suficiente stock disponible en ninguna obra para completar el pedido.",
            ListaObras: obrasDetalle,
            ProductosFaltantes: productosFaltantes,
            pedido_final
        };
    }
};
*/

/* VERSION 2 error en "hay stock"
const calcularStock = require('../EgresoMateriales/CalcularStock');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const { Obra } = require('../../../models');

module.exports = async function obtenerDisponibilidad(obra_id, items) {
    const obrasDetalle = {};
    const productosFaltantes = [];
    const pedido_final = [];

    for (const item of items) {
        const stockPrincipal = await calcularStock(item.producto_id, obra_id);
        let cantidadRestante = item.cantidad - stockPrincipal;

        // Inicializar estructura temporal
        const pedidoTemporal = {
            id: item.producto_id,
            nombre: item.producto_name,
            cantidadTotal: item.cantidad,
            obrasSeleccionadas: []
        };

        if (!obrasDetalle[obra_id]) {
            obrasDetalle[obra_id] = { id: obra_id, productos: [] };
        }

        if (stockPrincipal > 0) {
            pedidoTemporal.obrasSeleccionadas.push({
                id: obra_id,
                nombre: "", // lo llenamos después
                stockRequerido: stockPrincipal
            });

            obrasDetalle[obra_id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: stockPrincipal
            });
        }

        if (cantidadRestante <= 0) {
            // La obra principal cubre todo
            pedido_final.push(pedidoTemporal);
            continue;
        }

        // Buscar obras con stock extra
        const obrasConStock = await obtenerObrasConStock(item.producto_id);
        const opcionesDeObras = [];

        for (const obra of obrasConStock) {
            if (obra.obra_id == obra_id) continue;
            opcionesDeObras.push({
                id: obra.obra_id,
                nombre: obra.obra_name,
                stockDisponible: obra.stock
            });
        }

        opcionesDeObras.sort((a, b) => b.stockDisponible - a.stockDisponible);

        for (const obra of opcionesDeObras) {
            if (cantidadRestante <= 0) break;

            const cantidadAportada = Math.min(obra.stockDisponible, cantidadRestante);
            cantidadRestante -= cantidadAportada;

            pedidoTemporal.obrasSeleccionadas.push({
                id: obra.id,
                nombre: obra.nombre,
                stockRequerido: cantidadAportada
            });

            if (!obrasDetalle[obra.id]) {
                obrasDetalle[obra.id] = { id: obra.id, productos: [] };
            }

            obrasDetalle[obra.id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: cantidadAportada
            });
        }

        if (cantidadRestante === 0) {
            // Solo ahora que se cubrió todo, lo agregamos al pedido_final
            pedido_final.push(pedidoTemporal);
        } else {
            // No se pudo cubrir todo el producto
            productosFaltantes.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidadFaltante: cantidadRestante,
                opcionesObras: opcionesDeObras
            });
        }
    }

    // Completar nombres de obras
    const idsObras = Object.keys(obrasDetalle);
    const obrasInfo = await Obra.findAll({
        where: { id: idsObras },
        attributes: ['id', 'nombre']
    });

    obrasInfo.forEach(obra => {
        obrasDetalle[obra.id].nombre = obra.nombre;
    });

    // Completar los nombres en pedido_final
    for (const producto of pedido_final) {
        producto.obrasSeleccionadas.forEach(ob => {
            ob.nombre = obrasDetalle[ob.id]?.nombre || "Obra desconocida";
        });
    }

    if (productosFaltantes.length === 0) {
        return {
            Success: "Hay stock",
            msg: "La obra principal (o con apoyo) tiene suficiente stock para cubrir el pedido.",
            ListaObras: obrasDetalle,
            ProductosFaltantes: [],
            pedido_final
        };
    }

    let mensaje = `📦 El pedido no puede ser cubierto completamente con el stock disponible. Los siguientes productos tienen faltante:\n\n`;
    for (const faltante of productosFaltantes) {
        mensaje += `🔸 *${faltante.nombre}* - Faltan ${faltante.cantidadFaltante} unidades\n`;
        if (faltante.opcionesObras.length > 0) {
            mensaje += `  Opciones:\n`;
            faltante.opcionesObras.forEach(op => {
                mensaje += `   - ${op.nombre}: ${op.stockDisponible} disponibles\n`;
            });
        } else {
            mensaje += `  ❌ No hay otras obras con stock disponible.\n`;
        }
        mensaje += `\n`;
    }

    return {
        Success: "Faltante parcial",
        msg: mensaje,
        ListaObras: obrasDetalle,
        ProductosFaltantes: productosFaltantes,
        pedido_final
    };
};
*/

/* VERSION 1
const calcularStock = require('../EgresoMateriales/CalcularStock');
const obtenerObrasConStock = require('../EgresoMateriales/ObtenerObrasConStock');
const { Obra } = require('../../../models');

module.exports = async function obtenerDisponibilidad(obra_id, items) {
    let sePuedeDesdeObraPrincipal = true;
    const obrasDetalle = {};
    const productosFaltantes = [];
    const pedido_final = [];

    for (const item of items) {
        const stockPrincipal = await calcularStock(item.producto_id, obra_id);

        if (!obrasDetalle[obra_id]) obrasDetalle[obra_id] = { id: obra_id, productos: [] };

        // Si la obra principal tiene todo el stock → directo a pedido_final
        if (stockPrincipal >= item.cantidad) {
            obrasDetalle[obra_id].productos.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidad: item.cantidad
            });

            pedido_final.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidadTotal: item.cantidad,
                obrasSeleccionadas: [{
                    id: obra_id,
                    nombre: "", // lo completamos más abajo con el nombre real
                    stockRequerido: item.cantidad
                }]
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

                pedido_final.push({
                    id: item.producto_id,
                    nombre: item.producto_name,
                    cantidadTotal: item.cantidad,
                    obrasSeleccionadas: [{
                        id: obra_id,
                        nombre: "",
                        stockRequerido: stockPrincipal
                    }]
                });
            }

            const obrasConStock = await obtenerObrasConStock(item.producto_id);
            const opcionesDeObras = [];

            for (const obra of obrasConStock) {
                if (obra.obra_id == obra_id) continue;

                opcionesDeObras.push({
                    id: obra.obra_id,
                    nombre: obra.obra_name,
                    stockDisponible: obra.stock
                });
            }

            opcionesDeObras.sort((a, b) => b.stockDisponible - a.stockDisponible);

            productosFaltantes.push({
                id: item.producto_id,
                nombre: item.producto_name,
                cantidadFaltante: cantidadRestante,
                opcionesObras: opcionesDeObras
            });

            if (opcionesDeObras.length > 0) {
                const mejorObra = opcionesDeObras[0];
                const cantidadAportada = Math.min(mejorObra.stockDisponible, cantidadRestante);
                cantidadRestante -= cantidadAportada;

                if (!obrasDetalle[mejorObra.id]) {
                    obrasDetalle[mejorObra.id] = { id: mejorObra.id, productos: [] };
                }

                obrasDetalle[mejorObra.id].productos.push({
                    id: item.producto_id,
                    nombre: item.producto_name,
                    cantidad: cantidadAportada
                });

                let productoFinal = pedido_final.find(p => p.id === item.producto_id);
                if (!productoFinal) {
                    productoFinal = {
                        id: item.producto_id,
                        nombre: item.producto_name,
                        cantidadTotal: item.cantidad,
                        obrasSeleccionadas: []
                    };
                    pedido_final.push(productoFinal);
                }

                productoFinal.obrasSeleccionadas.push({
                    id: mejorObra.id,
                    nombre: mejorObra.nombre,
                    stockRequerido: cantidadAportada
                });

                if (cantidadRestante > 0) {
                    return {
                        Success: "No stock",
                        msg: "Ninguna obra tiene la posibilidad de suplir el pedido.",
                        ListaObras: obrasDetalle,
                        ProductosFaltantes: productosFaltantes,
                        pedido_final
                    };
                }
            } else {
                return {
                    Success: "No stock",
                    msg: "Ninguna obra tiene la posibilidad de suplir el pedido.",
                    ListaObras: obrasDetalle,
                    ProductosFaltantes: productosFaltantes,
                    pedido_final
                };
            }
        }
    }

    // Obtener nombres de las obras
    const idsObras = Object.keys(obrasDetalle);
    const obrasInfo = await Obra.findAll({
        where: { id: idsObras },
        attributes: ['id', 'nombre']
    });

    obrasInfo.forEach(obra => {
        obrasDetalle[obra.id].nombre = obra.nombre;
    });

    // Completar los nombres en pedido_final
    for (const producto of pedido_final) {
        producto.obrasSeleccionadas.forEach(ob => {
            ob.nombre = obrasDetalle[ob.id]?.nombre || "Obra desconocida";
        });
    }

    if (sePuedeDesdeObraPrincipal) {
        return {
            Success: "Hay stock",
            msg: "La obra principal tiene suficiente stock para cubrir el pedido.",
            ListaObras: obrasDetalle,
            ProductosFaltantes: [],
            pedido_final
        };
    }

    let mensaje = `📦 El pedido no puede ser cubierto únicamente por la obra principal. Se requiere apoyo de otras obras:\n\n`;
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
        ListaObras: obrasDetalle,
        ProductosFaltantes: productosFaltantes,
        pedido_final
    };
};
*/