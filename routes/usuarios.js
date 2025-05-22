const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Formulario para crear usuario
router.get('/nuevo', (req, res) => {
  res.render('usuario_add', { title: 'Crear Usuario' });
});

// Crear usuario (POST)
router.post('/', async (req, res) => {
  const { nombre, email, rol } = req.body;
  try {
    await Usuario.create({ nombre, email, rol });
    res.redirect('/usuarios');
  } catch (err) {
    res.status(400).send('Error creando usuario');
  }
});

// Listar usuarios
router.get('/', async (req, res) => {
  const usuarios = await Usuario.find();
  res.render('usuarios', { usuarios, title: 'Usuarios' });
});

module.exports = router;
