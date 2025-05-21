// routes/services.js
const express = require('express');
const router = express.Router();

// Ejemplo de servicios
const services = [
  { id: 1, name: 'Mantenimiento', description: 'Servicio de mantenimiento preventivo.' },
  { id: 2, name: 'Reparación', description: 'Servicio de reparación de dispositivos.' },
  { id: 3, name: 'Instalación', description: 'Servicio de instalación de nuevos equipos.' }
];

// Ruta para mostrar todos los servicios







module.exports = router;// Puedes agregar más rutas según sea necesario});  res.render('services', { services });outer.get('/', (req, res) => {