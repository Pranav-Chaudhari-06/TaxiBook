const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('passenger'), rideController.createRideRequest);
router.get('/my', requireRole('passenger'), rideController.getMyRideRequests);
router.get('/available', requireRole('driver'), rideController.getAvailableRides);
router.get('/estimate-cost', rideController.estimateCostEndpoint);
router.get('/:id', rideController.getRideRequest);
router.delete('/:id', requireRole('passenger'), rideController.cancelRideRequest);

module.exports = router;
