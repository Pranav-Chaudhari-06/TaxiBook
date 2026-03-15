const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', required: true },
  sourceAddress: { type: String, required: true },
  destinationAddress: { type: String, required: true },
  sourceCity: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  destinationCity: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  sourceCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  destinationCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  fromDateTime: { type: Date, required: true },
  toDateTime: { type: Date, required: true },
  passengerCount: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ['Open', 'Booked', 'Cancelled'],
    default: 'Open',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RideRequest', rideRequestSchema);
