const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken, requireRole('driver'));

router.get('/profile', driverController.getProfile);
router.put('/profile', upload.single('image'), driverController.updateProfile);
router.put('/change-password', driverController.changePassword);

module.exports = router;
