const mongoose = require('mongoose');
const Device = require('./models/Device');

function randomLatLon() {
  // Simula una ubicación dentro de un campus (ejemplo: Bogotá, Colombia)
  const lat = 4.601 + Math.random() * 0.01;
  const lon = -74.066 + Math.random() * 0.01;
  return { lat, lon };
}

function randomEstado() {
  // Devuelve true (OK) o false (Fallo)
  return Math.random() > 0.2;
}

async function simularDispositivos(n = 10) {
  await mongoose.connect('mongodb+srv://root:root@cluster0.f9hx1.mongodb.net/transporteRobotDrones?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const dispositivos = [];
  for (let i = 1; i <= n; i++) {
    const tipo = Math.random() > 0.5 ? 'robot' : 'dron';
    dispositivos.push({
      id: `${tipo === 'robot' ? 'RBT' : 'DRN'}-${i.toString().padStart(3, '0')}`,
      tipo,
      bateria: Math.floor(Math.random() * 70) + 30, // 30-100
      estado: 'disponible',
      sensores: {
        gps: randomEstado(),
        camara: randomEstado(),
        motor: randomEstado()
      },
      ubicacion: randomLatLon(),
      capacidad: {
        pesoMax: tipo === 'robot' ? 20 : 5, // robots: 20kg, drones: 5kg
        largoMax: tipo === 'robot' ? 100 : 50, // cm
        anchoMax: tipo === 'robot' ? 80 : 40, // cm
        altoMax: tipo === 'robot' ? 80 : 40 // cm
      }
    });
  }
  await Device.insertMany(dispositivos);
  console.log('Dispositivos simulados insertados');
  mongoose.connection.close();
}

simularDispositivos(15);
