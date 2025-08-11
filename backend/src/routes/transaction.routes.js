const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
    transactions, 
    dashboard, 
    addTransaction, 
    transferMoneyToAccount 
} = require('../controller/transactions.controller');

//ROUTES
router.get('/', authMiddleware, transactions)
router.get('/dashboard', authMiddleware, dashboard)
router.post('/add-transaction/:account_id', authMiddleware, addTransaction)
router.put('/transfer-money', authMiddleware, transferMoneyToAccount)


module.exports = router;