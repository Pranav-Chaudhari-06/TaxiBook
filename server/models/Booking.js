const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  interest: { type: mongoose.Schema.Types.ObjectId, ref: 'Interest', required: true },
  rideStatus: {
    type: String,
    enum: ['Ride Booked', 'In Progress', 'Ride Completed', 'Cancelled'],
    default: 'Ride Booked',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
