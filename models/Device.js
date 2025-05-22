const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  id: String,
  tipo: { type: String, enum: ['robot', 'dron'], required: true },
  bateria: Number,
  estado: { type: String, enum: ['disponible', 'en servicio', 'mantenimiento'], default: 'disponible' },
  sensores: {
    gps: Boolean,
    camara: Boolean,
    motor: Boolean
  },
  ubicacion: {
    lat: Number,
    lon: Number
  },
  capacidad: {
    pesoMax: Number,
    largoMax: Number,
    anchoMax: Number,
    altoMax: Number
  }
});

module.exports = mongoose.model('Device', deviceSchema);
