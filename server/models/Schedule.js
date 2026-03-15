const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
});

module.exports = mongoose.model('Schedule', scheduleSchema);
