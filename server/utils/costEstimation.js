const FuelRegistry = require('../models/FuelRegistry');

/**
 * Estimate ride cost based on distance and fuel type
 * Formula: distance_km × fuel.pricePerKm
 */
const estimateCost = async (distanceKm, fuelTypeId) => {
  const fuel = await FuelRegistry.findById(fuelTypeId);
  if (!fuel) {
    throw new Error('Fuel type not found');
  }
  return Math.round(distanceKm * fuel.pricePerKm * 100) / 100;
};

/**
 * Estimate cost using vehicle mileage
 * Formula: (distance_km / vehicle.mileage) × fuel.pricePerKm
 */
const estimateCostWithMileage = async (distanceKm, mileage, fuelTypeId) => {
  const fuel = await FuelRegistry.findById(fuelTypeId);
  if (!fuel) {
    throw new Error('Fuel type not found');
  }
  return Math.round((distanceKm / mileage) * fuel.pricePerKm * 100) / 100;
};

module.exports = { estimateCost, estimateCostWithMileage };
