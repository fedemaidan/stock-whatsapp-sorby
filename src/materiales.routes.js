const express = require('express');
const router = express.Router();
const { Material } = require('../src/models'); // Ajustá el path si tu carpeta de modelos está en otro lado

// Obtener todos los materiales
router.get('/', async (req, res) => {
    try {
        const materiales = await Material.findAll();
        res.json(materiales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los materiales' });
    }
});

// Obtener un material por ID
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (material) {
            res.json(material);
        } else {
            res.status(404).json({ error: 'Material no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar el material' });
    }
});

// Crear un nuevo material
router.post('/', async (req, res) => {
    try {
        console.log(req.body)
        const nuevoMaterial = await Material.create(req.body);
        res.status(201).json(nuevoMaterial);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error al crear el material' });
    }
});

// Actualizar un material por ID
router.put('/:id', async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (material) {
            await material.update(req.body);
            res.json(material);
        } else {
            res.status(404).json({ error: 'Material no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el material' });
    }
});

// Eliminar un material por ID
router.delete('/:id', async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (material) {
            await material.destroy();
            res.json({ mensaje: 'Material eliminado' });
        } else {
            res.status(404).json({ error: 'Material no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el material' });
    }
});

module.exports = router;
