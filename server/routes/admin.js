const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('admin'));

router.get('/stats', adminController.getStats);
router.get('/passengers', adminController.getAllPassengers);
router.get('/drivers', adminController.getAllDrivers);
router.get('/rides', adminController.getAllRides);
router.get('/bookings', adminController.getAllBookings);
router.delete('/passenger/:id', adminController.deletePassenger);
router.delete('/driver/:id', adminController.deleteDriver);
router.get('/report', adminController.getReport);

module.exports = router;
