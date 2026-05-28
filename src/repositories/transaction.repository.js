const Transaction = require('../models/transaction.model');

const create = async (data) => {
  return await Transaction.create(data);
};

const findByWalletId = async (carteiraId) => {
  return await Transaction.find({ carteiraId });
};

const findAll = async () => {
  return await Transaction.find();
};

module.exports = {
  create,
  findByWalletId,
  findAll
};