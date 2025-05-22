const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  dispositivoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  fechaInicio: { type: Date, required: true },
  fechaFin: { type: Date, required: true },
  estado: { type: String, enum: ['activo', 'cancelado', 'completado'], default: 'activo' },
  tipoServicio: { type: String, enum: ['transporte', 'grabacion'], required: true },
  datosContacto: {
    nombre: String,
    numero: String,
    email: String
  },
  origen: { type: String, required: true },
  destino: { type: String, required: true },
  pesoPaquete: { type: Number, required: true },
  largoPaquete: { type: Number, required: true },
  anchoPaquete: { type: Number, required: true },
  altoPaquete: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Reserva', reservaSchema);
