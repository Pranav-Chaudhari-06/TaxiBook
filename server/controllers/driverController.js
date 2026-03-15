const Driver = require('../models/Driver');
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

// GET /api/driver/profile
exports.getProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.user.id)
      .select('-password -otp -otpExpiry')
      .populate('city');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (err) {
    next(err);
  }
};

// PUT /api/driver/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updateData = { ...req.body };
    if (updateData.city === '' || updateData.city === null) delete updateData.city;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const driver = await Driver.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password -otp -otpExpiry')
      .populate('city');

    res.json(driver);
  } catch (err) {
    next(err);
  }
};

// PUT /api/driver/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { currentPassword, newPassword } = req.body;
    const driver = await Driver.findById(req.user.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const isMatch = await bcrypt.compare(currentPassword, driver.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    driver.password = await bcrypt.hash(newPassword, 12);
    await driver.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
