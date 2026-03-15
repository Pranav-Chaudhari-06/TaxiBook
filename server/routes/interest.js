const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', requireRole('driver'), interestController.expressInterest);
router.get('/ride/:rideId', requireRole('passenger'), interestController.getInterestsForRide);
router.get('/my', requireRole('driver'), interestController.getMyInterests);
router.delete('/:id', requireRole('driver'), interestController.withdrawInterest);

module.exports = router;
