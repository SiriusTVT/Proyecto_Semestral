const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Device = require('../models/Device');
const Bitacora = require('../models/Bitacora');

// GET /reservas → Lista todas las reservas
router.get('/', async (req, res) => {
  const filtro = {};
  const { dispositivoId, usuarioId, estado } = req.query;
  if (dispositivoId) filtro.dispositivoId = dispositivoId;
  if (usuarioId) filtro.usuarioId = usuarioId;
  // Si el filtro de estado está presente, mostrar todos los estados (incluido cancelado)
  if (typeof estado !== 'undefined' && estado !== '') filtro.estado = estado;
  // Si no hay filtro de estado, ocultar cancelados
  else filtro.estado = { $ne: 'cancelado' };
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
  // Mostrar todos los dispositivos, no solo los disponibles
  const dispositivos = await Device.find();
  const usuarios = await require('../models/Usuario').find();
  // Traer reservas activas para validación front-end
  const reservasExistentes = await require('../models/Reserva').find({
    estado: { $in: ['activo', 'completado'] }
  });
  res.render('reserva_add', { dispositivos, usuarios, reservasExistentes, title: 'Nueva Reserva' });
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
    const reserva = await Reserva.create({ dispositivoId, usuarioId, fechaInicio, fechaFin, tipoServicio });
    // Cambia el estado del dispositivo a "en servicio"
    await Device.findByIdAndUpdate(dispositivoId, { estado: 'en servicio' });
    // Registrar en bitácora
    const duracion = Math.round((new Date(fechaFin) - new Date(fechaInicio)) / 60000); // minutos
    await Bitacora.create({
      fecha: fechaInicio,
      dispositivo: dispositivoId,
      duracion,
      estado: 'pendiente',
      reserva: reserva._id
    });
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
