const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('passenger'), paymentController.createPayment);
router.get('/booking/:bookingId', paymentController.getPaymentByBooking);

module.exports = router;
