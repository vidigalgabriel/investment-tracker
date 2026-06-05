const walletService = require('../services/wallet.service');
const transactionService = require('../services/transaction.service');

const getAll = async (req, res) => {
  try {
    // Retorna a listagem de todas as carteiras
    const wallets = await walletService.getAllWallets();
    res.status(200).json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    // Cadastro de nova carteira vazia
    const wallet = await walletService.createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    // Alteração de dados cadastrais da carteira
    const wallet = await walletService.updateWallet(req.params.id, req.body);
    res.status(200).json(wallet);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    // Remoção da carteira por ID
    await walletService.deleteWallet(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    // Busca dados básicos da carteira
    const wallet = await walletService.getWalletById(req.params.id);
    let posicaoAtivos = {};
    let historicoTransacoes = [];
    
    // Consolida posições calculadas e histórico vinculado
    if (transactionService && transactionService.getWalletPosition) {
      posicaoAtivos = await transactionService.getWalletPosition(req.params.id);
    }

    if (transactionService && transactionService.getTransactions) {
      historicoTransacoes = await transactionService.getTransactions(req.params.id);
    }

    res.status(200).json({
      _id: wallet._id,
      nome: wallet.nome,
      descricao: wallet.descricao,
      posicao: posicaoAtivos,
      transacoes: historicoTransacoes
    });
  } catch (error) {
    console.log("========== ERRO NO BACKEND ==========");
    console.log(error.message);
    console.log("=====================================");
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
  getById
};