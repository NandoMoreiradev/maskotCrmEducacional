const express = require('express');
const router = express.Router();
const schoolAuthController = require('../controllers/schoolAuthController');

// Rota para login de utilizadores de escola
// Ex: POST /api/auth/school/login
router.post('/login', schoolAuthController.loginSchoolUser);

// No futuro, pode haver rotas para "esqueci minha senha", etc.

module.exports = router;