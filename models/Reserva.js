const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  estado: { type: String, enum: ['activo', 'cancelado', 'completado'], default: 'activo' },
  tipoServicio: { type: String, enum: ['transporte', 'grabacion'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);
