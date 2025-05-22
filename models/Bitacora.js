const mongoose = require('mongoose');

const bitacoraSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  dispositivo: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  duracion: { type: Number, required: true }, // duración en minutos
  estado: { type: String, enum: ['pendiente', 'en curso', 'finalizado', 'cancelado'], default: 'pendiente' },
  reserva: { type: mongoose.Schema.Types.ObjectId, ref: 'Reserva' },
  pesoPaquete: { type: Number },
  largoPaquete: { type: Number },
  anchoPaquete: { type: Number },
  altoPaquete: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Bitacora', bitacoraSchema);
