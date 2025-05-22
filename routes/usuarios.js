const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Middleware para proteger rutas según rol
function requireRole(roles) {
  return (req, res, next) => {
    if (req.session && roles.includes(req.session.rol)) return next();
    res.status(403).send('Acceso denegado');
  };
}

// Formulario para crear usuario
router.get('/nuevo', requireRole(['admin']), (req, res) => {
  res.render('usuario_add', { title: 'Crear Usuario' });
});

// Crear usuario (POST)
router.post('/', requireRole(['admin']), async (req, res) => {
  const { nombre, email, rol } = req.body;
  try {
    await Usuario.create({ nombre, email, rol });
    res.redirect('/usuarios');
  } catch (err) {
    res.status(400).send('Error creando usuario');
  }
});

// Listar usuarios
router.get('/', requireRole(['admin', 'operador']), async (req, res) => {
  const usuarios = await Usuario.find();
  res.render('usuarios', { usuarios, title: 'Usuarios' });
});

module.exports = router;
