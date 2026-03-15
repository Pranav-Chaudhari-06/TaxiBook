const Interest = require('../models/Interest');
const Vehicle = require('../models/Vehicle');
const RideRequest = require('../models/RideRequest');
const { estimateCost } = require('../utils/costEstimation');
const Joi = require('joi');

const interestSchema = Joi.object({
  rideRequestId: Joi.string().required(),
  estimatedCost: Joi.number().required(),
});

// POST /api/interest
exports.expressInterest = async (req, res, next) => {
  try {
    const { error } = interestSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { rideRequestId, estimatedCost } = req.body;

    // Check vehicle exists for this driver
    const vehicle = await Vehicle.findOne({ driver: req.user.id });
    if (!vehicle) {
      return res.status(400).json({ message: 'You must register a vehicle before expressing interest' });
    }

    // Check ride request exists and is open
    const rideRequest = await RideRequest.findById(rideRequestId);
    if (!rideRequest) return res.status(404).json({ message: 'Ride request not found' });
    if (rideRequest.status !== 'Open') {
      return res.status(400).json({ message: 'Ride request is no longer open' });
    }

    // Check driver hasn't already expressed interest
    const existingInterest = await Interest.findOne({
      rideRequest: rideRequestId,
      vehicle: vehicle._id,
    });
    if (existingInterest) {
      return res.status(400).json({ message: 'You have already expressed interest in this ride' });
    }

    const interest = await Interest.create({
      rideRequest: rideRequestId,
      vehicle: vehicle._id,
      estimatedCost,
    });

    res.status(201).json(interest);
  } catch (err) {
    next(err);
  }
};

// GET /api/interest/ride/:rideId
exports.getInterestsForRide = async (req, res, next) => {
  try {
    const interests = await Interest.find({ rideRequest: req.params.rideId })
      .populate({
        path: 'vehicle',
        populate: ['driver', 'fuelType'],
      })
      .sort({ createdAt: -1 });
    res.json(interests);
  } catch (err) {
    next(err);
  }
};

// GET /api/interest/my
exports.getMyInterests = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ driver: req.user.id });
    if (!vehicle) return res.json([]);

    const interests = await Interest.find({ vehicle: vehicle._id })
      .populate({
        path: 'rideRequest',
        populate: ['passenger', 'sourceCity', 'destinationCity'],
      })
      .sort({ createdAt: -1 });
    res.json(interests);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/interest/:id
exports.withdrawInterest = async (req, res, next) => {
  try {
    const interest = await Interest.findById(req.params.id).populate('vehicle');
    if (!interest) return res.status(404).json({ message: 'Interest not found' });

    // Verify this driver's vehicle
    if (interest.vehicle.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if booking already exists for this interest
    const Booking = require('../models/Booking');
    const booking = await Booking.findOne({ interest: interest._id });
    if (booking) {
      return res.status(400).json({ message: 'Cannot withdraw — booking already confirmed' });
    }

    await Interest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Interest withdrawn' });
  } catch (err) {
    next(err);
  }
};
