const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  carteiraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  ativo: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    required: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  preco: {
    type: Number,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);