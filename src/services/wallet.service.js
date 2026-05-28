const walletRepository = require('../repositories/wallet.repository');

const getAllWallets = async () => {
  return await walletRepository.findAll();
};

const createWallet = async (data) => {
  return await walletRepository.create(data);
};

const updateWallet = async (id, data) => {
  const wallet = await walletRepository.update(id, data);
  if (!wallet) throw new Error('Carteira não encontrada');
  return wallet;
};

const deleteWallet = async (id) => {
  const wallet = await walletRepository.remove(id);
  if (!wallet) throw new Error('Carteira não encontrada');
  return wallet;
};

const getWalletById = async (id) => {
  const wallet = await walletRepository.findById(id);
  if (!wallet) throw new Error('Carteira não encontrada');
  return wallet;
};

module.exports = {
  getAllWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  getWalletById
};