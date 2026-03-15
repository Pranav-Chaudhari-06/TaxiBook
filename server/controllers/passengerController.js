const Passenger = require('../models/Passenger');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const updateSchema = Joi.object({
  fname: Joi.string(),
  mname: Joi.string().allow(''),
  lname: Joi.string(),
  contact: Joi.string().allow(''),
  address: Joi.string().allow(''),
  city: Joi.string().allow('', null),
  dob: Joi.date().allow(null, ''),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow(''),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// GET /api/passenger/profile
exports.getProfile = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.user.id)
      .select('-password -otp -otpExpiry')
      .populate('city');
    if (!passenger) return res.status(404).json({ message: 'Passenger not found' });
    res.json(passenger);
  } catch (err) {
    next(err);
  }
};

// PUT /api/passenger/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updateData = { ...req.body };
    if (updateData.city === '' || updateData.city === null) delete updateData.city;

    // Handle image upload
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const passenger = await Passenger.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password -otp -otpExpiry')
      .populate('city');

    res.json(passenger);
  } catch (err) {
    next(err);
  }
};

// PUT /api/passenger/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { currentPassword, newPassword } = req.body;
    const passenger = await Passenger.findById(req.user.id);
    if (!passenger) return res.status(404).json({ message: 'Passenger not found' });

    const isMatch = await bcrypt.compare(currentPassword, passenger.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    passenger.password = await bcrypt.hash(newPassword, 12);
    await passenger.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
