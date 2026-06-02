const transactionService = require('../services/transaction.service');

const create = async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions(req.query.walletId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(req.params.id, req.body);
    res.status(200).json(transaction);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await transactionService.deleteTransaction(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  create,
  getAll,
  update,
  remove
};