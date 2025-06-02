const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
// const { authenticateAdmin } = require('../middlewares/authMiddleware'); // Criaremos depois

// Rota para login do admin
router.post('/login', adminAuthController.loginAdmin);

// Rota para registrar um novo admin (PROTEGER OU REMOVER EM PRODUÇÃO)
router.post('/register', adminAuthController.registerAdmin); // Cuidado com esta rota

module.exports = router;