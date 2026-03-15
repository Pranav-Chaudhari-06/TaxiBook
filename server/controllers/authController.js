const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const Vehicle = require('../models/Vehicle');
const { generateOTP, sendOTPEmail } = require('../utils/sendOTP');
const Joi = require('joi');

const passengerRegisterSchema = Joi.object({
  fname: Joi.string().required(),
  mname: Joi.string().allow(''),
  lname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  dob: Joi.date().allow(null, ''),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow(''),
  contact: Joi.string().allow(''),
  address: Joi.string().allow(''),
  city: Joi.string().allow('', null),
});

const driverRegisterSchema = Joi.object({
  fname: Joi.string().required(),
  mname: Joi.string().allow(''),
  lname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  dob: Joi.date().allow(null, ''),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow(''),
  contact: Joi.string().allow(''),
  address: Joi.string().allow(''),
  city: Joi.string().allow('', null),
  vehicle: Joi.object({
    companyName: Joi.string().required(),
    model: Joi.string().required(),
    fuelType: Joi.string().required(),
    mileage: Joi.number().required(),
    passengerCapacity: Joi.number().required(),
    vehicleNumber: Joi.string().required(),
    vehiclePermit: Joi.string().allow(''),
    vehicleInsurance: Joi.string().allow(''),
  }).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('passenger', 'driver', 'admin').required(),
});

// Generate tokens
const generateTokens = (user, role) => {
  const payload = { id: user._id, role, email: user.email };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return { accessToken, refreshToken };
};

// POST /api/auth/register/passenger
exports.registerPassenger = async (req, res, next) => {
  try {
    const { error } = passengerRegisterSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, city, ...rest } = req.body;

    const existing = await Passenger.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const passenger = await Passenger.create({
      ...rest,
      email: email.toLowerCase(),
      password: hashedPassword,
      city: city || undefined,
      otp,
      otpExpiry,
      isVerified: false,
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: passenger._id,
      role: 'passenger',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register/driver
exports.registerDriver = async (req, res, next) => {
  try {
    const { error } = driverRegisterSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, city, vehicle, ...rest } = req.body;

    const existing = await Driver.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const driver = await Driver.create({
      ...rest,
      email: email.toLowerCase(),
      password: hashedPassword,
      city: city || undefined,
      otp,
      otpExpiry,
      isVerified: false,
    });

    // Create vehicle for this driver
    await Vehicle.create({
      driver: driver._id,
      ...vehicle,
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent.',
      userId: driver._id,
      role: 'driver',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp, role } = req.body;
    if (!userId || !otp || !role) {
      return res.status(400).json({ message: 'userId, otp, and role are required' });
    }

    const Model = role === 'passenger' ? Passenger : Driver;
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (user.otpExpiry < new Date()) return res.status(400).json({ message: 'OTP has expired' });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) return res.status(400).json({ message: 'userId and role are required' });

    const Model = role === 'passenger' ? Passenger : Driver;
    const user = await Model.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOTPEmail(user.email, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, role } = req.body;

    let user;
    if (role === 'passenger') user = await Passenger.findOne({ email: email.toLowerCase() });
    else if (role === 'driver') user = await Driver.findOne({ email: email.toLowerCase() });
    else if (role === 'admin') user = await Admin.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (role !== 'admin' && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first', userId: user._id, role });
    }

    const { accessToken, refreshToken } = generateTokens(user, role);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: role === 'admin' ? user.name : `${user.fname} ${user.lname}`,
        role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// POST /api/auth/refresh-token
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    let user;
    if (decoded.role === 'passenger') user = await Passenger.findById(decoded.id);
    else if (decoded.role === 'driver') user = await Driver.findById(decoded.id);
    else if (decoded.role === 'admin') user = await Admin.findById(decoded.id);

    if (!user) return res.status(401).json({ message: 'User not found' });

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, decoded.role);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
