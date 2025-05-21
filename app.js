const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Rutas
app.get('/', (req, res) => {
  const dispositivos = [
    { id: 'R1', tipo: 'Robot', bateria: '85%' },
    { id: 'D1', tipo: 'Drone', bateria: '70%' },
    { id: 'R2', tipo: 'Robot', bateria: '92%' },
  ];
  res.render('dashboard', { dispositivos, title: 'Panel de Monitoreo' });
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});