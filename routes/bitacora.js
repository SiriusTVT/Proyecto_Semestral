const express = require('express');
const router = express.Router();
const Bitacora = require('../models/Bitacora');
const Device = require('../models/Device');
const Reserva = require('../models/Reserva');

// Historial de servicios para el administrador
router.get('/', async (req, res) => {
  const bitacoras = await Bitacora.find().populate('dispositivo reserva');
  res.render('bitacora', { bitacoras, title: 'Bitácora de Servicios' });
});

module.exports = router;
