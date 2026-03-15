const { sendEmail } = require('../config/nodemailer');

const sendCancelEmail = async (passengerEmail, driverEmail, bookingDetails) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Booking Cancelled</h2>
      <p>A booking has been cancelled. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingDetails.bookingId}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Source:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingDetails.source}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Destination:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingDetails.destination}</td></tr>
        <tr><td style="padding: 8px;"><strong>Cancelled by:</strong></td><td style="padding: 8px;">${bookingDetails.cancelledBy}</td></tr>
      </table>
      <p style="color: #999; font-size: 12px; margin-top: 15px;">This is an automated notification from Taxi Booking System.</p>
    </div>
  `;

  const promises = [];

  if (passengerEmail) {
    promises.push(
      sendEmail({ to: passengerEmail, subject: 'Booking Cancelled - Taxi Booking System', html })
    );
  }

  if (driverEmail) {
    promises.push(
      sendEmail({ to: driverEmail, subject: 'Booking Cancelled - Taxi Booking System', html })
    );
  }

  await Promise.allSettled(promises);
};

module.exports = sendCancelEmail;
