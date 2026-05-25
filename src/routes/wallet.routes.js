const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');

router.get('/', walletController.getAll);
router.post('/', walletController.create);
router.put('/:id', walletController.update);
router.delete('/:id', walletController.remove);

module.exports = router;