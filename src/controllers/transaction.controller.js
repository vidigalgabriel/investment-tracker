const transactionService = require('../services/transaction.service');

const create = async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const getByWallet = async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions(req.query.walletId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  create,
  getByWallet
};