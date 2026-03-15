const express = require('express');
const router = express.Router();
const State = require('../models/State');
const City = require('../models/City');
const FuelRegistry = require('../models/FuelRegistry');

// GET /api/location/states
router.get('/states', async (req, res, next) => {
  try {
    const states = await State.find().sort({ stateName: 1 });
    res.json(states);
  } catch (err) {
    next(err);
  }
});

// GET /api/location/cities/search?q= (must be before :stateId)
router.get('/cities/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const cities = await City.find({
      cityName: { $regex: q, $options: 'i' },
    })
      .populate('state')
      .limit(20);
    res.json(cities);
  } catch (err) {
    next(err);
  }
});

// GET /api/location/cities/:stateId
router.get('/cities/:stateId', async (req, res, next) => {
  try {
    const cities = await City.find({ state: req.params.stateId }).sort({ cityName: 1 });
    res.json(cities);
  } catch (err) {
    next(err);
  }
});

// GET /api/location/fuel-types
router.get('/fuel-types', async (req, res, next) => {
  try {
    const fuels = await FuelRegistry.find();
    res.json(fuels);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
