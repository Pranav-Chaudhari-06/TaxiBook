const mongoose = require('mongoose');

const fuelRegistrySchema = new mongoose.Schema({
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric'],
    required: true,
  },
  pricePerKm: { type: Number, required: true },
});

module.exports = mongoose.model('FuelRegistry', fuelRegistrySchema);
