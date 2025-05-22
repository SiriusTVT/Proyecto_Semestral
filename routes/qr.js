const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Bitacora = require('../models/Bitacora');

// Generar QR para un servicio (bitácora)
router.get('/:id/qr', async (req, res) => {
  const bitacora = await Bitacora.findById(req.params.id).populate('dispositivo reserva');
  if (!bitacora) return res.status(404).send('Servicio no encontrado');
  // El QR contendrá el ID del servicio y un mensaje
  const qrData = JSON.stringify({ servicio: bitacora._id, mensaje: 'Entrega de servicio' });
  const qr = await QRCode.toDataURL(qrData);
  res.render('qr_entrega', { qr, bitacora, title: 'Entrega QR' });
});

// Marcar servicio como entregado
router.post('/:id/entregar', async (req, res) => {
  await Bitacora.findByIdAndUpdate(req.params.id, { estado: 'finalizado' });
  res.redirect('/bitacora');
});

module.exports = router;
