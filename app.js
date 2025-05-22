const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const deviceRoutes = require('./routes/devices');
const reservasRoutes = require('./routes/reservas');
const usuariosRoutes = require('./routes/usuarios');
const bitacoraRoutes = require('./routes/bitacora');
const qrRoutes = require('./routes/qr');
const mongoose = require('mongoose');
const Device = require('./models/Device'); // Asegúrate de que la ruta sea correcta
const session = require('express-session');
const Usuario = require('./models/Usuario');

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
app.use(session({
  secret: 'secreto_super_seguro',
  resave: false,
  saveUninitialized: false
}));

// Middleware global para que session esté disponible en todas las vistas EJS
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use('/devices', deviceRoutes);
app.use('/reservas', reservasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/bitacora', bitacoraRoutes);
app.use('/qr', qrRoutes);

// Rutas
app.get('/', async (req, res) => {
  try {
    const dispositivos = await Device.find();
    res.render('dashboard', { dispositivos, title: 'Panel de Monitoreo', session: req.session });
  } catch (err) {
    res.status(500).send('Error obteniendo dispositivos');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { error: null, title: 'Login' });
});

app.post('/login', async (req, res) => {
  const { email } = req.body;
  // Permitir login tanto a admin como a operador
  const usuario = await Usuario.findOne({ email, rol: { $in: ['admin', 'operador'] } });
  if (usuario) {
    req.session.usuarioId = usuario._id;
    req.session.rol = usuario.rol;
    return res.redirect('/');
  }
  res.render('login', { error: 'Credenciales inválidas o usuario sin permisos', title: 'Login' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Middleware para proteger rutas de admin
function requireLogin(req, res, next) {
  if (req.session && req.session.rol === 'admin') return next();
  res.redirect('/login');
}

// Middleware para proteger rutas según rol
function requireRole(roles) {
  return (req, res, next) => {
    if (req.session && roles.includes(req.session.rol)) return next();
    res.status(403).send('Acceso denegado');
  };
}

// En views, oculta botones de agregar/eliminar dispositivos y crear usuario si no tiene rol adecuado

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});