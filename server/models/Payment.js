const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  paidAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
