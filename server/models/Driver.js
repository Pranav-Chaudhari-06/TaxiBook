const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  mname: { type: String, default: '' },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  contact: { type: String },
  address: { type: String },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  image: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Driver', driverSchema);
