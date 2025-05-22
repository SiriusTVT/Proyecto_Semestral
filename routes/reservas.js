const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Device = require('../models/Device');

// GET /reservas → Lista todas las reservas
router.get('/', async (req, res) => {
  const reservas = await Reserva.find().populate('dispositivoId');
  res.render('reservas', { reservas, title: 'Reservas' });
});

// GET /reservas/nueva → Formulario para nueva reserva
router.get('/nueva', async (req, res) => {
  const dispositivos = await Device.find({ estado: 'disponible' });
  res.render('reserva_add', { dispositivos, title: 'Nueva Reserva' });
});

// POST /reservas → Crear reserva
router.post('/', async (req, res) => {
  const { dispositivoId, fechaInicio, fechaFin, tipoServicio, usuarioId } = req.body;
  try {
    await Reserva.create({ dispositivoId, usuarioId, fechaInicio, fechaFin, tipoServicio });
    // Cambia el estado del dispositivo a "en servicio"
    await Device.findByIdAndUpdate(dispositivoId, { estado: 'en servicio' });
    res.redirect('/reservas');
  } catch (err) {
    res.status(400).send('Error creando reserva');
  }
});

// GET /reservas/:id/editar → Formulario para editar reserva
router.get('/:id/editar', async (req, res) => {
  const reserva = await Reserva.findById(req.params.id);
  const dispositivos = await Device.find();
  res.render('reserva_edit', { reserva, dispositivos, title: 'Editar Reserva' });
});

// POST /reservas/:id → Actualizar reserva
router.post('/:id', async (req, res) => {
  const { dispositivoId, fechaInicio, fechaFin, tipoServicio, usuarioId, estado } = req.body;
  try {
    await Reserva.findByIdAndUpdate(req.params.id, { dispositivoId, usuarioId, fechaInicio, fechaFin, tipoServicio, estado });
    res.redirect('/reservas');
  } catch (err) {
    res.status(400).send('Error actualizando reserva');
  }
});

// POST /reservas/:id/cancelar → Cancelar reserva
router.post('/:id/cancelar', async (req, res) => {
  try {
    await Reserva.findByIdAndUpdate(req.params.id, { estado: 'cancelado' });
    res.redirect('/reservas');
  } catch (err) {
    res.status(400).send('Error cancelando reserva');
  }
});

module.exports = router;
