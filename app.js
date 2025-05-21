const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const deviceRoutes = require('./routes/devices');
const reservasRoutes = require('./routes/reservas');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use('/devices', deviceRoutes);
app.use('/reservas', reservasRoutes);

// Rutas
app.get('/', (req, res) => {
  res.redirect('/devices');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});