const calcularStock = require("../../Utiles/Helpers/EgresoMateriales/CalcularStock");
const { Material, Obra, Movimiento } = require('../../models');
const { addMovimientoToSheetWithClientGeneral } = require('../../Utiles/GoogleServices/Sheets/movimiento');
require('dotenv').config();

module.exports = async function ajustarStock(idobra) {

    const json = [
        { "nombre": "BmB Curva de Plastico para caño de 1\"", "cantidad": 100 },
        { "nombre": "Casablanca Interioir Mate Blanco (xLts) (Abierto)", "cantidad": 11 },
        { "nombre": "Casablanca Interioir Mate Copa Real (x lts) Bse B (Abierto)", "cantidad": 9 },
        { "nombre": "Genrod  Caja de pase derivacion (unidades) 15x15", "cantidad": 1 },
        { "nombre": "Genrod Caja de pase 20x20", "cantidad": 0 },
        { "nombre": "Horno Longive H1500XF", "cantidad": 2 },
        { "nombre": "Jeluz Platinum Modulo 2 tomas Normalizado +Tierra 2x10A-250VCA Bl", "cantidad": 50 },
        { "nombre": "Kalop Conductor Unipolar 1;5 MM Celeste", "cantidad": 3 },
        { "nombre": "Kalop Conductor Unipolar 1;5MM Blanco", "cantidad": 4 },
        { "nombre": "Kalop Conductor Unipolar 1;5MM Rojo", "cantidad": 4 },
        { "nombre": "Kalop Conductor Unipolar 2;5MM Celeste", "cantidad": 12 },
        { "nombre": "Kalop Conductor Unipolar 2;5MM Rojo", "cantidad": 9 },
        { "nombre": "Kalop Conductor Unipolar 2;5MM V/Amarillo", "cantidad": 13 },
        { "nombre": "Kalop Conductor Unipolar 4MM Celeste", "cantidad": 3 },
        { "nombre": "Kalop Conductor Unipolar 4MM Rojo", "cantidad": 4 },
        { "nombre": "Kalop Conductor Unipolar 4MM V/Amarillo", "cantidad": 6 },
        { "nombre": "Ladrillo Refractario color cemento", "cantidad": 54 },
        { "nombre": "Lajas Refrectarias Simil Cemento", "cantidad": 101 },
        { "nombre": "Perfiles para Tira Led Per12 para aplicar (x2mts cada uno)", "cantidad": 4 },
        { "nombre": "Tacsa Precinto 4;6 MM x 100 U-Negro (bolsas de 100 U)", "cantidad": 15 },
        { "nombre": "Reflex 2;5MM Rojo", "cantidad": 10 },
        { "nombre": "Reflex 1;5MM Rojo", "cantidad": 6 },
        { "nombre": "Reflex 2;5MM Verde", "cantidad": 11 },
        { "nombre": "Reflex 1;5MM Verde", "cantidad": 7 },
        { "nombre": "Reflex 2;5MM Celeste", "cantidad": 10 },
        { "nombre": "Reflex 1;5 MM Celeste", "cantidad": 6 },
        { "nombre": "Reflex 1;5MM Negro", "cantidad": 0 },
        { "nombre": "Reflex 1;5MM Blanco", "cantidad": 1 },
        { "nombre": "KlK Imp Flex Anclaje Int x25Kg", "cantidad": 33 },
        { "nombre": "Tbcin Cinta Aisladora Vini Tape 10 Mts Negro", "cantidad": 79 },
        { "nombre": "Masilla Casablanca (Cerrado)(Kg)", "cantidad": 32 },
        { "nombre": "Masilla Casablanca (Abierto) (Kg)", "cantidad": 25 },
        { "nombre": "Weber Col SuperFlex 25Kg", "cantidad": 0 }
    ];

    const movimientos = [];
    const fechaActual = new Date();
    const obra = await Obra.findOne({ where: { nombre: 'FlyDac' } });

    if (!obra) {
        throw new Error(`No se encontró la obra con id: ${idobra}`);
    }

    for (const item of json) {
        const material = await Material.findOne({ where: { nombre: item.nombre } });

        if (!material) {
            console.warn(`Material no encontrado: ${item.nombre}`);
            continue;
        }

        const stockActual = await calcularStock(material.id, obra.id);
        const diferencia = item.cantidad - stockActual;

        if (diferencia !== 0) {
            movimientos.push({
                fecha: fechaActual,
                nombre: item.nombre,
                id_material: material.id,
                cod_obra_origen: obra.id,
                cantidad: Math.abs(diferencia),
                tipo: diferencia > 0, // true para ingreso, false para egreso
                estado: 'Ajuste'
            });
        }
    }

    // Insertar todos los movimientos
    const movimientosCreados = await Movimiento.bulkCreate(movimientos);

    for (const movimiento of movimientosCreados) {
        console.log("📤 Enviando movimiento:", movimiento.dataValues);
        await addMovimientoToSheetWithClientGeneral(movimiento.dataValues, { sheetWithClient: process.env.GOOGLE_SHEET_ID });
    }
    console.log(`Se registraron ${movimientos.length} movimientos de ajuste de stock.`);
};