const Vehicle = require('../models/Vehicle');
const Joi = require('joi');

const vehicleSchema = Joi.object({
  companyName: Joi.string().required(),
  model: Joi.string().required(),
  fuelType: Joi.string().required(),
  mileage: Joi.number().required(),
  passengerCapacity: Joi.number().required(),
  vehicleNumber: Joi.string().required(),
  vehiclePermit: Joi.string().allow(''),
  vehicleInsurance: Joi.string().allow(''),
});

const vehicleUpdateSchema = Joi.object({
  companyName: Joi.string(),
  model: Joi.string(),
  fuelType: Joi.string(),
  mileage: Joi.number(),
  passengerCapacity: Joi.number(),
  vehicleNumber: Joi.string(),
  vehiclePermit: Joi.string().allow(''),
  vehicleInsurance: Joi.string().allow(''),
});

// POST /api/vehicle
exports.registerVehicle = async (req, res, next) => {
  try {
    const { error } = vehicleSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const existing = await Vehicle.findOne({ driver: req.user.id });
    if (existing) return res.status(400).json({ message: 'Vehicle already registered. Use update instead.' });

    const vehicle = await Vehicle.create({
      driver: req.user.id,
      ...req.body,
    });

    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
};

// GET /api/vehicle/my
exports.getMyVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ driver: req.user.id }).populate('fuelType');
    if (!vehicle) return res.status(404).json({ message: 'No vehicle registered' });
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
};

// PUT /api/vehicle/:id
exports.updateVehicle = async (req, res, next) => {
  try {
    const { error } = vehicleUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const vehicle = await Vehicle.findOne({ _id: req.params.id, driver: req.user.id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    Object.assign(vehicle, req.body);
    await vehicle.save();

    const updated = await Vehicle.findById(vehicle._id).populate('fuelType');
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
