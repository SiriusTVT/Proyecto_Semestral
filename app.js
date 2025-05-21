const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const deviceRoutes = require('./routes/devices');
const reservasRoutes = require('./routes/reservas');
const mongoose = require('mongoose');
const Device = require('./models/Device'); // Asegúrate de que la ruta sea correcta

mongoose.connect('mongodb+srv://root:root@cluster0.f9hx1.mongodb.net/transporteRobotDrones?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use('/devices', deviceRoutes);
app.use('/reservas', reservasRoutes);

// Rutas
app.get('/', async (req, res) => {
  try {
    const dispositivos = await Device.find();
    res.render('dashboard', { dispositivos, title: 'Panel de Monitoreo' });
  } catch (err) {
    res.status(500).send('Error obteniendo dispositivos');
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});