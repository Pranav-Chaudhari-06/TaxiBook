const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  companyName: { type: String, required: true },
  model: { type: String, required: true },
  fuelType: { type: mongoose.Schema.Types.ObjectId, ref: 'FuelRegistry', required: true },
  mileage: { type: Number, required: true },
  passengerCapacity: { type: Number, required: true },
  vehicleNumber: { type: String, required: true },
  vehiclePermit: { type: String, default: '' },
  vehicleInsurance: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
