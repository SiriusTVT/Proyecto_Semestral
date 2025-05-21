const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const indexRoutes = require('./routes/index');
const deviceRoutes = require('./routes/devices');
const serviceRoutes = require('./routes/services');


app.use('/', indexRoutes);
app.use('/devices', deviceRoutes);
app.use('/services', serviceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
