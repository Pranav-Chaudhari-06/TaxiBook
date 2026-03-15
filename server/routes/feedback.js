const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('passenger'), feedbackController.createFeedback);
router.get('/booking/:bookingId', feedbackController.getFeedbackByBooking);

module.exports = router;
