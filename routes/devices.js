const express = require('express');
const router = express.Router();

// Datos simulados temporalmente
let dispositivos = [
  { id: 'R1', tipo: 'Robot', bateria: '85%' },
  { id: 'D1', tipo: 'Drone', bateria: '70%' },
];

// Mostrar todos los dispositivos
router.get('/', (req, res) => {
  res.render('dashboard', { dispositivos, title: 'Panel de Monitoreo' });
});

// Agregar un nuevo dispositivo (temporal con query)
router.get('/add', (req, res) => {
  const { id, tipo, bateria } = req.query;
  dispositivos.push({ id, tipo, bateria });
  res.redirect('/devices');
});

// Eliminar dispositivo por ID
router.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  dispositivos = dispositivos.filter(d => d.id !== id);
  res.redirect('/devices');
});

module.exports = router;
