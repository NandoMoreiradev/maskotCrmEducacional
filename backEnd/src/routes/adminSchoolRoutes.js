const express = require('express');
const router = express.Router();
const adminSchoolController = require('../controllers/adminSchoolController');
const { authenticateAdmin } = require('../middlewares/authMiddleware'); // Importe o middleware

// Todas as rotas abaixo agora serão protegidas pelo middleware authenticateAdmin
router.post('/', authenticateAdmin, adminSchoolController.createSchool);
router.get('/', authenticateAdmin, adminSchoolController.getAllSchools);
router.get('/:schoolId', authenticateAdmin, adminSchoolController.getSchoolById);
router.put('/:schoolId', authenticateAdmin, adminSchoolController.updateSchool);
router.delete('/:schoolId', authenticateAdmin, adminSchoolController.deleteSchool);

module.exports = router;