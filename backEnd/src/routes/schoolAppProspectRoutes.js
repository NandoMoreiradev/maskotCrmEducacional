const express = require('express');
const router = express.Router();
const schoolAppProspectController = require('../controllers/schoolAppProspectController');
const { authenticateSchoolUser } = require('../middlewares/authenticateSchoolUser'); // Middleware para utilizadores da escola

// Todas as rotas aqui serão prefixadas com /api/school/prospects (definido no app.js)
// e protegidas pelo authenticateSchoolUser

router.post('/', authenticateSchoolUser, schoolAppProspectController.createProspect);
router.get('/', authenticateSchoolUser, schoolAppProspectController.listProspects);
router.get('/:prospectId', authenticateSchoolUser, schoolAppProspectController.getProspectById);
router.put('/:prospectId', authenticateSchoolUser, schoolAppProspectController.updateProspect);
router.delete('/:prospectId', authenticateSchoolUser, schoolAppProspectController.deleteProspect);

module.exports = router;