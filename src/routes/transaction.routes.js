const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

router.post('/', transactionController.create);
router.get('/', transactionController.getAll);

module.exports = router;