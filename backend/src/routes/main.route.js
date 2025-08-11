const express = require('express');
const router = express.Router();

// Importing all Local route modules
const accountRoutes = require('./account.routes');
const transactionRoutes = require('./transaction.routes');
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');

// Mounting all Local route modules
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/account', accountRoutes);
router.use('/transactions', transactionRoutes);


module.exports = router;