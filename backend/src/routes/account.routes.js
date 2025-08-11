const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

const{ getAccount, createAccount, addMoneyToAccount } = require('../controller/account.controller');


router.get('/:id', authMiddleware, getAccount);
router.post('/create', authMiddleware, createAccount);
router.put('/add-money/:id', authMiddleware, addMoneyToAccount);


module.exports = router;