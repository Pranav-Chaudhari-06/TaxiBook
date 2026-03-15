const express = require('express');
const router = express.Router();
const passengerController = require('../controllers/passengerController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(verifyToken, requireRole('passenger'));

router.get('/profile', passengerController.getProfile);
router.put('/profile', upload.single('image'), passengerController.updateProfile);
router.put('/change-password', passengerController.changePassword);

module.exports = router;
