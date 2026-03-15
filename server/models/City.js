const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  cityName: { type: String, required: true },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State', required: true },
});

module.exports = mongoose.model('City', citySchema);
