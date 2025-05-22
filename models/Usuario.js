const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, enum: ['operador', 'admin'], default: 'operador' }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
