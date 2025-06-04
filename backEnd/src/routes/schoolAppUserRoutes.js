const express = require('express');
const router = express.Router();
const schoolAppUserController = require('../controllers/schoolAppUserController');
const { authenticateSchoolUser } = require('../middlewares/authenticateSchoolUser'); // Novo middleware

// Todas as rotas aqui serão prefixadas com algo como /api/school (definido no app.js)
// e protegidas pelo authenticateSchoolUser

router.get('/', authenticateSchoolUser, schoolAppUserController.listMySchoolUsers);
router.post('/', authenticateSchoolUser, schoolAppUserController.createMySchoolUser);
router.put('/:userId', authenticateSchoolUser, schoolAppUserController.updateMySchoolUser);
router.delete('/:userId', authenticateSchoolUser, schoolAppUserController.deleteMySchoolUser);

module.exports = router;