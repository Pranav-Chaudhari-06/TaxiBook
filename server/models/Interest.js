const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  rideRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'RideRequest', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  estimatedCost: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Interest', interestSchema);
