const Wallet = require('../models/wallet.model');

const findAll = async () => {
  return await Wallet.find();
};

const create = async (data) => {
  return await Wallet.create(data);
};

const update = async (id, data) => {
  return await Wallet.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (id) => {
  return await Wallet.findByIdAndDelete(id);
};

module.exports = {
  findAll,
  create,
  update,
  remove
};