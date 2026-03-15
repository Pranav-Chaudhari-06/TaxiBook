const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Interest = require('../models/Interest');
const Joi = require('joi');

const paymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  transactionId: Joi.string().required(),
});

// POST /api/payment
exports.createPayment = async (req, res, next) => {
  try {
    const { error } = paymentSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { bookingId, transactionId } = req.body;

    const booking = await Booking.findById(bookingId).populate('interest');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.rideStatus !== 'Ride Completed') {
      return res.status(400).json({ message: 'Payment can only be made for completed rides' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ booking: bookingId });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already made for this booking' });
    }

    const amount = booking.interest.estimatedCost;

    const payment = await Payment.create({
      booking: bookingId,
      transactionId,
      amount,
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

// GET /api/payment/booking/:bookingId
exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};
