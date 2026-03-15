const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');

const generateReport = async (fromDate, toDate) => {
  const dateFilter = {};
  if (fromDate) dateFilter.$gte = new Date(fromDate);
  if (toDate) dateFilter.$lte = new Date(toDate);

  const bookingFilter = fromDate || toDate ? { createdAt: dateFilter } : {};
  const paymentFilter = fromDate || toDate ? { paidAt: dateFilter } : {};
  const userFilter = fromDate || toDate ? { createdAt: dateFilter } : {};

  const [totalBookings, completedBookings, cancelledBookings, payments, newPassengers, newDrivers] =
    await Promise.all([
      Booking.countDocuments(bookingFilter),
      Booking.countDocuments({ ...bookingFilter, rideStatus: 'Ride Completed' }),
      Booking.countDocuments({ ...bookingFilter, rideStatus: 'Cancelled' }),
      Payment.find(paymentFilter),
      Passenger.countDocuments(userFilter),
      Driver.countDocuments(userFilter),
    ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const doc = new PDFDocument({ margin: 50 });

  // Header
  doc.fontSize(22).font('Helvetica-Bold').text('Taxi Booking System', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text('Report', { align: 'center' });
  doc.moveDown();

  // Date range
  if (fromDate || toDate) {
    const from = fromDate ? new Date(fromDate).toLocaleDateString() : 'All time';
    const to = toDate ? new Date(toDate).toLocaleDateString() : 'Present';
    doc.fontSize(11).text(`Date Range: ${from} — ${to}`, { align: 'center' });
  } else {
    doc.fontSize(11).text('Date Range: All Time', { align: 'center' });
  }

  doc.moveDown(2);

  // Bookings section
  doc.fontSize(16).font('Helvetica-Bold').text('Bookings');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Bookings: ${totalBookings}`);
  doc.text(`Completed: ${completedBookings}`);
  doc.text(`Cancelled: ${cancelledBookings}`);
  doc.text(`In Progress / Booked: ${totalBookings - completedBookings - cancelledBookings}`);
  doc.moveDown(1.5);

  // Revenue section
  doc.fontSize(16).font('Helvetica-Bold').text('Revenue');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
  doc.text(`Total Payments: ${payments.length}`);
  doc.moveDown(1.5);

  // Users section
  doc.fontSize(16).font('Helvetica-Bold').text('User Registrations');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`Passengers: ${newPassengers}`);
  doc.text(`Drivers: ${newDrivers}`);
  doc.moveDown(2);

  // Footer
  doc.fontSize(9).fillColor('#999').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

  return doc;
};

module.exports = generateReport;
