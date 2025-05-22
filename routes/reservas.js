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
  const dispositivos = await Device.find();
  // No se cargan usuarios, solo dispositivos y reservas existentes
  const reservasExistentes = await require('../models/Reserva').find({
    estado: { $in: ['activo', 'completado'] }
  });
  res.render('reserva_add', { dispositivos, reservasExistentes, title: 'Nueva Reserva' });
});

// POST /reservas → Crear reserva
router.post('/', async (req, res) => {
  const { dispositivoId, fechaInicio, fechaFin, tipoServicio, nombre, numero, email, origen, destino, pesoPaquete, largoPaquete, anchoPaquete, altoPaquete } = req.body;
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
    // Verificar estado del dispositivo antes de crear la reserva
    const dispositivo = await Device.findById(dispositivoId);
    let errores = [];
    if (!dispositivo) {
      errores.push('Dispositivo no encontrado.');
    } else {
      if (dispositivo.bateria < 30) errores.push('Nivel de batería insuficiente (< 30%).');
      if (!dispositivo.sensores || !dispositivo.sensores.gps) errores.push('GPS no disponible.');
      if (!dispositivo.sensores || !dispositivo.sensores.camara) errores.push('Cámara no disponible.');
      if (!dispositivo.sensores || !dispositivo.sensores.motor) errores.push('Motor no disponible.');
      // Solo bloquear si está en mantenimiento
      if (dispositivo.estado === 'mantenimiento') errores.push('El dispositivo está en mantenimiento.');
      // Validar peso y dimensiones
      if (dispositivo.capacidad) {
        if (Number(pesoPaquete) > dispositivo.capacidad.pesoMax) errores.push('El peso del paquete excede la capacidad máxima del dispositivo.');
        if (Number(largoPaquete) > dispositivo.capacidad.largoMax) errores.push('El largo del paquete excede la capacidad máxima del dispositivo.');
        if (Number(anchoPaquete) > dispositivo.capacidad.anchoMax) errores.push('El ancho del paquete excede la capacidad máxima del dispositivo.');
        if (Number(altoPaquete) > dispositivo.capacidad.altoMax) errores.push('El alto del paquete excede la capacidad máxima del dispositivo.');
      }
    }
    if (errores.length > 0) {
      // Reutiliza las variables ya obtenidas en el GET /nueva
      return res.render('reserva_add', {
        dispositivos: await Device.find(),
        reservasExistentes: await Reserva.find({ estado: { $in: ['activo', 'completado'] } }),
        title: 'Nueva Reserva',
        error: errores.join(' '),
        nombre,
        numero,
        email,
        origen,
        destino,
        fechaInicio,
        fechaFin,
        tipoServicio,
        dispositivoId,
        pesoPaquete,
        largoPaquete,
        anchoPaquete,
        altoPaquete
      });
    }
    // Guardar los datos del usuario no autenticado en la reserva
    const reserva = await Reserva.create({ dispositivoId, fechaInicio, fechaFin, tipoServicio, datosContacto: { nombre, numero, email }, origen, destino, pesoPaquete, largoPaquete, anchoPaquete, altoPaquete });
    // Cambia el estado del dispositivo a "en servicio"
    await Device.findByIdAndUpdate(dispositivoId, { estado: 'en servicio' });
    // Registrar en bitácora
    const duracion = Math.round((new Date(fechaFin) - new Date(fechaInicio)) / 60000); // minutos
    await Bitacora.create({
      fecha: fechaInicio,
      dispositivo: dispositivoId,
      duracion,
      estado: 'pendiente',
      reserva: reserva._id,
      pesoPaquete,
      largoPaquete,
      anchoPaquete,
      altoPaquete
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
  const usuarios = await require('../models/Usuario').find();
  res.render('reserva_edit', { reserva, dispositivos, usuarios, title: 'Editar Reserva' });
});

// POST /reservas/:id → Actualizar reserva
router.post('/:id', async (req, res) => {
  const { dispositivoId, fechaInicio, fechaFin, tipoServicio, estado, nombre, numero, email, origen, destino, pesoPaquete, largoPaquete, anchoPaquete, altoPaquete } = req.body;
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
    if (solapada && estado === 'activo') {
      return res.status(400).send('El dispositivo ya tiene una reserva activa en ese rango de fechas');
    }
    // Verificar estado del dispositivo antes de actualizar la reserva
    const dispositivo = await Device.findById(dispositivoId);
    let errores = [];
    if (!dispositivo) {
      errores.push('Dispositivo no encontrado.');
    } else {
      if (dispositivo.bateria < 30) errores.push('Nivel de batería insuficiente (< 30%).');
      if (!dispositivo.sensores || !dispositivo.sensores.gps) errores.push('GPS no disponible.');
      if (!dispositivo.sensores || !dispositivo.sensores.camara) errores.push('Cámara no disponible.');
      if (!dispositivo.sensores || !dispositivo.sensores.motor) errores.push('Motor no disponible.');
      if (dispositivo.estado === 'mantenimiento') errores.push('El dispositivo está en mantenimiento.');
      // Validar peso y dimensiones
      if (dispositivo.capacidad) {
        if (Number(pesoPaquete) > dispositivo.capacidad.pesoMax) errores.push('El peso del paquete excede la capacidad máxima del dispositivo.');
        if (Number(largoPaquete) > dispositivo.capacidad.largoMax) errores.push('El largo del paquete excede la capacidad máxima del dispositivo.');
        if (Number(anchoPaquete) > dispositivo.capacidad.anchoMax) errores.push('El ancho del paquete excede la capacidad máxima del dispositivo.');
        if (Number(altoPaquete) > dispositivo.capacidad.altoMax) errores.push('El alto del paquete excede la capacidad máxima del dispositivo.');
      }
    }
    if (errores.length > 0) {
      // Reutiliza las variables ya obtenidas
      const reserva = await Reserva.findById(req.params.id);
      const dispositivos = await Device.find();
      const usuarios = await require('../models/Usuario').find();
      return res.render('reserva_edit', {
        reserva: {
          ...reserva.toObject(),
          pesoPaquete,
          largoPaquete,
          anchoPaquete,
          altoPaquete
        },
        dispositivos,
        usuarios,
        title: 'Editar Reserva',
        error: errores.join(' ')
      });
    }
    // Actualiza la reserva
    await Reserva.findByIdAndUpdate(req.params.id, {
      dispositivoId,
      fechaInicio,
      fechaFin,
      tipoServicio,
      estado,
      datosContacto: { nombre, numero, email },
      origen,
      destino,
      pesoPaquete,
      largoPaquete,
      anchoPaquete,
      altoPaquete
    });
    // Si la reserva se completa o cancela, el dispositivo vuelve a estar disponible
    if (estado === 'cancelado' || estado === 'completado') {
      await Device.findByIdAndUpdate(dispositivoId, { estado: 'disponible' });
    } else if (estado === 'activo') {
      await Device.findByIdAndUpdate(dispositivoId, { estado: 'en servicio' });
    }
    res.redirect('/reservas');
  } catch (err) {
    res.status(400).send('Error actualizando reserva');
  }
});

// POST /reservas/:id/cancelar → Cancelar reserva
router.post('/:id/cancelar', async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(req.params.id, { estado: 'cancelado' }, { new: true });
    if (reserva && reserva.dispositivoId) {
      await Device.findByIdAndUpdate(reserva.dispositivoId, { estado: 'disponible' });
    }
    res.redirect('/reservas');
  } catch (err) {
    res.status(400).send('Error cancelando reserva');
  }
});

module.exports = router;
