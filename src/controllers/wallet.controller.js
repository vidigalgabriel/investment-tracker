const walletService = require('../services/wallet.service');
const transactionService = require('../services/transaction.service');

const getAll = async (req, res) => {
  try {
    const wallets = await walletService.getAllWallets();
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const wallet = await walletService.updateWallet(req.params.id, req.body);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await walletService.deleteWallet(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const wallet = await walletService.getWalletById(req.params.id);
    const posicaoAtivos = await transactionService.getWalletPosition(req.params.id);
    
    res.status(200).json({
      _id: wallet._id,
      nome: wallet.nome,
      descricao: wallet.descricao,
      posicao: posicaoAtivos
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  getById
};