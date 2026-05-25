const Transaction = require('../models/transaction.model');

const create = async (data) => {
  return await Transaction.create(data);
};

const findAll = async () => {
  return await Transaction.find();
};

const findByWalletId = async (walletId) => {
  return await Transaction.find({ carteiraId: walletId });
};

module.exports = {
  create,
  findAll,
  findByWalletId
};