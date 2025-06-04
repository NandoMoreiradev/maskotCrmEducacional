const express = require('express');
const router = express.Router({ mergeParams: true }); 
const adminSchoolUserController = require('../controllers/adminSchoolUserController');
const { authenticateAdmin } = require('../middlewares/authMiddleware');

// Rotas existentes
router.post('/', authenticateAdmin, adminSchoolUserController.createUserForSchool);
router.get('/', authenticateAdmin, adminSchoolUserController.getUsersForSchool);

// --- NOVAS ROTAS ---
router.put('/:userId', authenticateAdmin, adminSchoolUserController.updateUserForSchool);
router.delete('/:userId', authenticateAdmin, adminSchoolUserController.deleteUserForSchool);

module.exports = router;