const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    dispositivos: [
      { id: 'DR001', tipo: 'Drone', estado: 'Disponible', bateria: 87 },
      { id: 'RB002', tipo: 'Robot', estado: 'En servicio', bateria: 45 }
    ]
  });
});

module.exports = router;