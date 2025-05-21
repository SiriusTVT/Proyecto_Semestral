const mongoose = require('mongoose');
const Device = require('./models/Device');

mongoose.connect('mongodb+srv://root:root@cluster0.f9hx1.mongodb.net/transporteRobotDrones?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conectado a MongoDB Atlas');
  return insertDevices();
})
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

async function insertDevices() {
  const dispositivos = [
    {
      id: 'RBT-001',
      tipo: 'robot',
      bateria: 87,
      estado: 'disponible',
      sensores: { gps: true, camara: true, motor: true },
      ubicacion: { lat: 4.601, lon: -74.066 }
    },
    {
      id: 'DRN-001',
      tipo: 'dron',
      bateria: 72,
      estado: 'mantenimiento',
      sensores: { gps: true, camara: false, motor: true },
      ubicacion: { lat: 4.603, lon: -74.065 }
    },
    {
      id: 'RBT-002',
      tipo: 'robot',
      bateria: 92,
      estado: 'en servicio',
      sensores: { gps: true, camara: true, motor: true },
      ubicacion: { lat: 4.602, lon: -74.067 }
    }
  ];

  try {
    await Device.insertMany(dispositivos);
    console.log('Dispositivos insertados correctamente');
  } catch (error) {
    console.error('Error insertando dispositivos:', error);
  } finally {
    mongoose.connection.close();
  }
}
