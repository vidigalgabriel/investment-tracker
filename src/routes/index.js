const express = require('express');
const router = express.Router();
const walletRoutes = require('./wallet.routes');
const transactionRoutes = require('./transaction.routes');

router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;