const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// Middleware para proteger rutas según rol
function requireRole(roles) {
  return (req, res, next) => {
    if (req.session && roles.includes(req.session.rol)) return next();
    res.status(403).send('Acceso denegado');
  };
}

// Mostrar todos los dispositivos (redirige a dashboard principal, opcional)
router.get('/', async (req, res) => {
  try {
    const dispositivos = await Device.find();
    res.render('dashboard', { dispositivos, title: 'Panel de Monitoreo', session: req.session });
  } catch (err) {
    res.status(500).send('Error obteniendo dispositivos');
  }
});

// Formulario para agregar un nuevo dispositivo
router.get('/add', requireRole(['admin', 'operador']), (req, res) => {
  res.render('device_add', { title: 'Agregar Dispositivo' });
});

// Agregar un nuevo dispositivo (POST)
router.post('/add', requireRole(['admin', 'operador']), async (req, res) => {
  const { id, tipo, bateria, estado, gps, camara, motor, lat, lon } = req.body;
  try {
    await Device.create({
      id,
      tipo,
      bateria,
      estado: estado || 'disponible',
      sensores: {
        gps: gps === 'on',
        camara: camara === 'on',
        motor: motor === 'on'
      },
      ubicacion: {
        lat,
        lon
      }
    });
    res.redirect('/devices');
  } catch (err) {
    res.status(400).send('Error agregando dispositivo');
  }
});

// Eliminar dispositivo por ID
router.get('/delete/:id', requireRole(['admin', 'operador']), async (req, res) => {
  const { id } = req.params;
  try {
    await Device.deleteOne({ id });
    res.redirect('/devices');
  } catch (err) {
    res.status(400).send('Error eliminando dispositivo');
  }
});

module.exports = router;
