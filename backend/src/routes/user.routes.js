const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
    getUser,
    updateUser,
    deleteUser,
    changePassword
} = require('../controller/user.controller');

router.get('/', authMiddleware, getUser);
router.put('/change-password', authMiddleware, changePassword);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);


module.exports = router;