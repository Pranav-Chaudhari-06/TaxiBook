const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');
const RideRequest = require('../models/RideRequest');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const Interest = require('../models/Interest');
const Schedule = require('../models/Schedule');
const Feedback = require('../models/Feedback');
const generateReport = require('../utils/generateReport');

// GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPassengers,
      totalDrivers,
      newPassengersThisMonth,
      newDriversThisMonth,
      totalRidesCompleted,
      payments,
    ] = await Promise.all([
      Passenger.countDocuments(),
      Driver.countDocuments(),
      Passenger.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Driver.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Booking.countDocuments({ rideStatus: 'Ride Completed' }),
      Payment.find(),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalPassengers,
      totalDrivers,
      newRegistrationsThisMonth: newPassengersThisMonth + newDriversThisMonth,
      totalRidesCompleted,
      totalRevenue,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/passengers
exports.getAllPassengers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const filter = search
      ? {
          $or: [
            { fname: { $regex: search, $options: 'i' } },
            { lname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [passengers, total] = await Promise.all([
      Passenger.find(filter)
        .select('-password -otp -otpExpiry')
        .populate('city')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Passenger.countDocuments(filter),
    ]);

    res.json({ passengers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/drivers
exports.getAllDrivers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const filter = search
      ? {
          $or: [
            { fname: { $regex: search, $options: 'i' } },
            { lname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [drivers, total] = await Promise.all([
      Driver.find(filter)
        .select('-password -otp -otpExpiry')
        .populate('city')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Driver.countDocuments(filter),
    ]);

    res.json({ drivers, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/rides
exports.getAllRides = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';

    const filter = status ? { status } : {};

    const [rides, total] = await Promise.all([
      RideRequest.find(filter)
        .populate('passenger', 'fname lname email')
        .populate('sourceCity destinationCity')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      RideRequest.countDocuments(filter),
    ]);

    res.json({ rides, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';

    const filter = status ? { rideStatus: status } : {};

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate({
          path: 'interest',
          populate: [
            { path: 'rideRequest', populate: ['passenger', 'sourceCity', 'destinationCity'] },
            { path: 'vehicle', populate: ['driver', 'fuelType'] },
          ],
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Booking.countDocuments(filter),
    ]);

    res.json({ bookings, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/passenger/:id
exports.deletePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByIdAndDelete(req.params.id);
    if (!passenger) return res.status(404).json({ message: 'Passenger not found' });

    // Cascade: clean up ride requests by this passenger
    const rideRequests = await RideRequest.find({ passenger: req.params.id });
    const rideRequestIds = rideRequests.map((r) => r._id);
    await Interest.deleteMany({ rideRequest: { $in: rideRequestIds } });
    await RideRequest.deleteMany({ passenger: req.params.id });

    res.json({ message: 'Passenger deleted' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/driver/:id
exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    // Cascade: delete vehicle and all related interests
    const vehicles = await Vehicle.find({ driver: req.params.id });
    const vehicleIds = vehicles.map((v) => v._id);
    await Interest.deleteMany({ vehicle: { $in: vehicleIds } });
    await Vehicle.deleteMany({ driver: req.params.id });

    res.json({ message: 'Driver and vehicle deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/report
exports.getReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const doc = await generateReport(from, to);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    doc.pipe(res);
    doc.end();
  } catch (err) {
    next(err);
  }
};
