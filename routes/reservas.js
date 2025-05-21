const express = require('express');
const router = express.Router();

// Simulamos que importamos dispositivos desde otro módulo (o usa un array local)
const dispositivos = [
  { id: 'R1', tipo: 'Robot', estado: 'Disponible' },
  { id: 'D1', tipo: 'Drone', estado: 'En servicio' },
  { id: 'R2', tipo: 'Robot', estado: 'Disponible' }
];

// Lista de reservas
let reservas = [];

// Ver todas las reservas
router.get('/', (req, res) => {
  res.render('reservas', { reservas, title: 'Reservas' });
});

// Ruta GET para mostrar formulario con dispositivos disponibles
router.get('/add', (req, res) => {
  // Filtramos solo los dispositivos disponibles
  const disponibles = dispositivos.filter(d => d.estado === 'Disponible');
  res.render('reserva_add', { dispositivos: disponibles });
});

// Modificar POST para validar dispositivo disponible
router.post('/add', (req, res) => {
  const { dispositivo, salida, regreso } = req.body;

  // Validar que el dispositivo esté disponible
  const dispo = dispositivos.find(d => d.id === dispositivo);
  if (!dispo || dispo.estado !== 'Disponible') {
    return res.status(400).send('Dispositivo no disponible');
  }

  // Cambiar estado a 'En servicio'
  dispo.estado = 'En servicio';

  const id = reservas.length + 1;
  reservas.push({ id, dispositivo, salida, regreso, estado: 'En curso' });
  res.redirect('/reservas');
});

// Al finalizar reserva cambiar estado dispositivo
router.post('/finalizar/:id', (req, res) => {
  const { id } = req.params;
  const reserva = reservas.find(r => r.id == id);
  if (reserva) {
    reserva.estado = 'Finalizado';

    // Liberar dispositivo
    const dispo = dispositivos.find(d => d.id === reserva.dispositivo);
    if (dispo) dispo.estado = 'Disponible';
  }
  res.redirect('/reservas');
});

module.exports = router;
