const Feedback = require('../models/Feedback');
const Payment = require('../models/Payment');
const Joi = require('joi');

const feedbackSchema = Joi.object({
  bookingId: Joi.string().required(),
  description: Joi.string().required(),
});

// POST /api/feedback
exports.createFeedback = async (req, res, next) => {
  try {
    const { error } = feedbackSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { bookingId, description } = req.body;

    // Verify payment exists for this booking
    const payment = await Payment.findOne({ booking: bookingId });
    if (!payment) {
      return res.status(400).json({ message: 'Payment must be made before leaving feedback' });
    }

    // Check if feedback already exists
    const existing = await Feedback.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ message: 'Feedback already submitted for this booking' });
    }

    const feedback = await Feedback.create({
      booking: bookingId,
      description,
    });

    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
};

// GET /api/feedback/booking/:bookingId
exports.getFeedbackByBooking = async (req, res, next) => {
  try {
    const feedback = await Feedback.findOne({ booking: req.params.bookingId });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    next(err);
  }
};
