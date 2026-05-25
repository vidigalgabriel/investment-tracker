const transactionRepository = require('../repositories/transaction.repository');

const createTransaction = async (data) => {
  if (!data.carteiraId || !data.ativo || !data.quantidade || !data.preco) {
    throw new Error('Dados obrigatórios ausentes');
  }
  return await transactionRepository.create(data);
};

const getTransactions = async (walletId) => {
  if (walletId) {
    return await transactionRepository.findByWalletId(walletId);
  }
  return await transactionRepository.findAll();
};

module.exports = {
  createTransaction,
  getTransactions
};