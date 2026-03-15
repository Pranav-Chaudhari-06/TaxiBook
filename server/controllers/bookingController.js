const Booking = require('../models/Booking');
const Interest = require('../models/Interest');
const RideRequest = require('../models/RideRequest');
const Schedule = require('../models/Schedule');
const Vehicle = require('../models/Vehicle');
const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');
const sendCancelEmail = require('../utils/sendCancelEmail');
const Joi = require('joi');

const createBookingSchema = Joi.object({
  interestId: Joi.string().required(),
});

// POST /api/booking
exports.createBooking = async (req, res, next) => {
  try {
    const { error } = createBookingSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { interestId } = req.body;

    const interest = await Interest.findById(interestId).populate('vehicle');
    if (!interest) return res.status(404).json({ message: 'Interest not found' });

    const rideRequest = await RideRequest.findById(interest.rideRequest);
    if (!rideRequest) return res.status(404).json({ message: 'Ride request not found' });

    // Verify the ride request belongs to this passenger
    if (rideRequest.passenger.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (rideRequest.status !== 'Open') {
      return res.status(400).json({ message: 'Ride request is no longer open' });
    }

    // Create booking
    const booking = await Booking.create({
      interest: interestId,
      rideStatus: 'Ride Booked',
    });

    // Create schedule
    await Schedule.create({
      booking: booking._id,
      driver: interest.vehicle.driver,
      fromDate: rideRequest.fromDateTime,
      toDate: rideRequest.toDateTime,
    });

    // Update ride request status
    rideRequest.status = 'Booked';
    await rideRequest.save();

    // Delete all other interests for this ride
    await Interest.deleteMany({
      rideRequest: rideRequest._id,
      _id: { $ne: interestId },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

// GET /api/booking/my  (passenger's bookings)
exports.getMyBookings = async (req, res, next) => {
  try {
    // Find ride requests by this passenger
    const rideRequests = await RideRequest.find({ passenger: req.user.id });
    const rideRequestIds = rideRequests.map((r) => r._id);

    // Find interests for those ride requests
    const interests = await Interest.find({ rideRequest: { $in: rideRequestIds } });
    const interestIds = interests.map((i) => i._id);

    // Find bookings for those interests
    const bookings = await Booking.find({ interest: { $in: interestIds } })
      .populate({
        path: 'interest',
        populate: [
          {
            path: 'rideRequest',
            populate: ['sourceCity', 'destinationCity'],
          },
          {
            path: 'vehicle',
            populate: ['driver', 'fuelType'],
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// GET /api/booking/driver  (driver's bookings)
exports.getDriverBookings = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ driver: req.user.id });
    if (!vehicle) return res.json([]);

    const interests = await Interest.find({ vehicle: vehicle._id });
    const interestIds = interests.map((i) => i._id);

    const bookings = await Booking.find({ interest: { $in: interestIds } })
      .populate({
        path: 'interest',
        populate: [
          {
            path: 'rideRequest',
            populate: ['passenger', 'sourceCity', 'destinationCity'],
          },
          {
            path: 'vehicle',
            populate: 'fuelType',
          },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// GET /api/booking/:id
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'interest',
      populate: [
        {
          path: 'rideRequest',
          populate: ['passenger', 'sourceCity', 'destinationCity'],
        },
        {
          path: 'vehicle',
          populate: ['driver', 'fuelType'],
        },
      ],
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// PUT /api/booking/:id/start
exports.startRide = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'interest',
      populate: 'vehicle',
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify driver owns this booking
    if (booking.interest.vehicle.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.rideStatus !== 'Ride Booked') {
      return res.status(400).json({ message: 'Ride can only be started from Booked status' });
    }

    booking.rideStatus = 'In Progress';
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// PUT /api/booking/:id/end
exports.endRide = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'interest',
      populate: 'vehicle',
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.interest.vehicle.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.rideStatus !== 'In Progress') {
      return res.status(400).json({ message: 'Ride can only be ended from In Progress status' });
    }

    booking.rideStatus = 'Ride Completed';
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// PUT /api/booking/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'interest',
      populate: [
        { path: 'rideRequest', populate: 'passenger' },
        { path: 'vehicle', populate: 'driver' },
      ],
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify the user is either the passenger or the driver of this booking
    const passengerId = booking.interest.rideRequest.passenger._id.toString();
    const driverId = booking.interest.vehicle.driver._id.toString();
    if (req.user.id !== passengerId && req.user.id !== driverId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.rideStatus === 'Ride Completed' || booking.rideStatus === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.rideStatus = 'Cancelled';
    await booking.save();

    // Send cancellation email to both parties
    const passenger = booking.interest.rideRequest.passenger;
    const driver = booking.interest.vehicle.driver;

    try {
      await sendCancelEmail(passenger.email, driver.email, {
        bookingId: booking._id,
        source: booking.interest.rideRequest.sourceAddress,
        destination: booking.interest.rideRequest.destinationAddress,
        cancelledBy: req.user.role === 'passenger' ? 'Passenger' : 'Driver',
      });
    } catch (emailErr) {
      console.error('Cancel email failed:', emailErr.message);
    }

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    next(err);
  }
};
