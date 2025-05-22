const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Device = require('../models/Device');

// GET /reservas → Lista todas las reservas
router.get('/', async (req, res) => {
  const filtro = {};
  const { dispositivoId, usuarioId, estado } = req.query;
  if (dispositivoId) filtro.dispositivoId = dispositivoId;
  if (usuarioId) filtro.usuarioId = usuarioId;
  if (estado) filtro.estado = estado;
  const reservas = await Reserva.find(filtro).populate('dispositivoId');
  const dispositivos = await Device.find();
  const usuarios = await require('../models/Usuario').find();
  res.render('reservas', {
    reservas,
    dispositivos,
    usuarios,
    filtroDispositivo: dispositivoId || '',
    filtroUsuario: usuarioId || '',
    filtroEstado: estado || '',
    title: 'Reservas'
  });
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
    // Validación de fechas
    if (!fechaInicio || !fechaFin || new Date(fechaFin) <= new Date(fechaInicio)) {
      return res.status(400).send('Fechas inválidas');
    }
    // Validar solapamiento de reservas activas para el dispositivo
    const solapada = await Reserva.findOne({
      dispositivoId,
      estado: { $in: ['activo', 'completado'] },
      $or: [
        { fechaInicio: { $lt: fechaFin }, fechaFin: { $gt: fechaInicio } }
      ]
    });
    if (solapada) {
      return res.status(400).send('El dispositivo ya tiene una reserva activa en ese rango de fechas');
    }
    // (Opcional) Validar penalidades de usuario aquí
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
