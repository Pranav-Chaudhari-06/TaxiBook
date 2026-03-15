const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('passenger'), bookingController.createBooking);
router.get('/my', requireRole('passenger'), bookingController.getMyBookings);
router.get('/driver', requireRole('driver'), bookingController.getDriverBookings);
router.get('/:id', bookingController.getBooking);
router.put('/:id/start', requireRole('driver'), bookingController.startRide);
router.put('/:id/end', requireRole('driver'), bookingController.endRide);
router.put('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
