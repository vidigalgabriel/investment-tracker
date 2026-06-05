const mongoose = require('mongoose');

async function connectDatabase() {
  try {
    // Conexão com o banco
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB conectado');
  } catch (error) {
    // Falha crítica na inicialização
    console.error('Erro ao conectar MongoDB', error);

    process.exit(1);
  }
}

module.exports = connectDatabase;