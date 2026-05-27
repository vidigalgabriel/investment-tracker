const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  descricao: {
    type: String
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Wallet', walletSchema);