const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken, requireRole('driver'));

router.post('/', vehicleController.registerVehicle);
router.get('/my', vehicleController.getMyVehicle);
router.put('/:id', vehicleController.updateVehicle);

module.exports = router;
