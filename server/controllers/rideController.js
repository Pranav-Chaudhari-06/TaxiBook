const RideRequest = require('../models/RideRequest');
const { estimateCost } = require('../utils/costEstimation');
const Joi = require('joi');

const rideRequestSchema = Joi.object({
  sourceAddress: Joi.string().required(),
  destinationAddress: Joi.string().required(),
  sourceCity: Joi.string().allow('', null),
  destinationCity: Joi.string().allow('', null),
  sourceCoords: Joi.object({ lat: Joi.number(), lng: Joi.number() }).allow(null),
  destinationCoords: Joi.object({ lat: Joi.number(), lng: Joi.number() }).allow(null),
  fromDateTime: Joi.date().required(),
  toDateTime: Joi.date().required(),
  passengerCount: Joi.number().integer().min(1).required(),
});

// POST /api/rides
exports.createRideRequest = async (req, res, next) => {
  try {
    const { error } = rideRequestSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Validate toDateTime > fromDateTime
    const from = new Date(req.body.fromDateTime);
    const to = new Date(req.body.toDateTime);
    if (to <= from) {
      return res.status(400).json({ message: 'To date/time must be after from date/time' });
    }

    // Check if passenger already has an open ride request
    const existingOpen = await RideRequest.findOne({
      passenger: req.user.id,
      status: 'Open',
    });
    if (existingOpen) {
      return res.status(400).json({ message: 'You already have an open ride request. Cancel it first to create a new one.' });
    }

    const ride = await RideRequest.create({
      passenger: req.user.id,
      ...req.body,
    });

    res.status(201).json(ride);
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/my
exports.getMyRideRequests = async (req, res, next) => {
  try {
    const rides = await RideRequest.find({ passenger: req.user.id })
      .populate('sourceCity destinationCity')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/available
exports.getAvailableRides = async (req, res, next) => {
  try {
    const rides = await RideRequest.find({ status: 'Open' })
      .populate('passenger', 'fname lname')
      .populate('sourceCity destinationCity')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/:id
exports.getRideRequest = async (req, res, next) => {
  try {
    const ride = await RideRequest.findById(req.params.id)
      .populate('passenger', 'fname lname email contact')
      .populate('sourceCity destinationCity');
    if (!ride) return res.status(404).json({ message: 'Ride request not found' });
    res.json(ride);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/rides/:id
exports.cancelRideRequest = async (req, res, next) => {
  try {
    const ride = await RideRequest.findOne({ _id: req.params.id, passenger: req.user.id });
    if (!ride) return res.status(404).json({ message: 'Ride request not found' });
    if (ride.status !== 'Open') {
      return res.status(400).json({ message: 'Only open ride requests can be cancelled' });
    }

    ride.status = 'Cancelled';
    await ride.save();
    res.json({ message: 'Ride request cancelled' });
  } catch (err) {
    next(err);
  }
};

// GET /api/rides/estimate-cost
exports.estimateCostEndpoint = async (req, res, next) => {
  try {
    const { distance, fuelTypeId } = req.query;
    if (!distance || !fuelTypeId) {
      return res.status(400).json({ message: 'distance and fuelTypeId are required' });
    }

    const cost = await estimateCost(parseFloat(distance), fuelTypeId);
    res.json({ estimatedCost: cost, distance: parseFloat(distance) });
  } catch (err) {
    next(err);
  }
};
