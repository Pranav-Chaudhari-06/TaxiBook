const request = require('supertest');
const mongoose = require('mongoose');
const { connectTestDB, disconnectTestDB, clearDB, generateTestToken, hashPassword } = require('./setup');

// Mock nodemailer before requiring app
jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
  }),
}));

const app = require('../app');

// Models
const Passenger = require('../models/Passenger');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const Vehicle = require('../models/Vehicle');
const FuelRegistry = require('../models/FuelRegistry');
const State = require('../models/State');
const City = require('../models/City');
const RideRequest = require('../models/RideRequest');
const Interest = require('../models/Interest');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// Shared state across tests
let passengerToken, driverToken, adminToken;
let passengerId, driverId, adminId;
let fuelTypeId, stateId, cityId;
let vehicleId, rideRequestId, interestId, bookingId;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ============================================================
// SEED DATA
// ============================================================
describe('Seed Data Setup', () => {
  test('should create fuel types', async () => {
    const fuels = await FuelRegistry.insertMany([
      { fuelType: 'Petrol', pricePerKm: 8.5 },
      { fuelType: 'Diesel', pricePerKm: 7.0 },
      { fuelType: 'CNG', pricePerKm: 5.0 },
      { fuelType: 'Electric', pricePerKm: 3.0 },
    ]);
    expect(fuels).toHaveLength(4);
    fuelTypeId = fuels[0]._id;
  });

  test('should create state and city', async () => {
    const state = await State.create({ stateName: 'Maharashtra' });
    stateId = state._id;
    const city = await City.create({ cityName: 'Mumbai', state: stateId });
    cityId = city._id;
  });

  test('should create admin user', async () => {
    const hashed = await hashPassword('admin123');
    const admin = await Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: hashed,
    });
    adminId = admin._id;
    adminToken = generateTestToken(adminId, 'admin', 'admin@test.com');
  });
});

// ============================================================
// LOCATION ROUTES (Public)
// ============================================================
describe('Location Routes', () => {
  test('GET /api/location/states — should return states', async () => {
    const res = await request(app).get('/api/location/states');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('stateName', 'Maharashtra');
  });

  test('GET /api/location/cities/:stateId — should return cities', async () => {
    const res = await request(app).get(`/api/location/cities/${stateId}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('cityName', 'Mumbai');
  });

  test('GET /api/location/cities/:stateId — invalid stateId returns empty', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/location/cities/${fakeId}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /api/location/cities/search?q= — should search cities', async () => {
    const res = await request(app).get('/api/location/cities/search?q=Mum');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].cityName).toContain('Mum');
  });

  test('GET /api/location/cities/search — empty query returns empty', async () => {
    const res = await request(app).get('/api/location/cities/search');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('GET /api/location/fuel-types — should return fuel types', async () => {
    const res = await request(app).get('/api/location/fuel-types');
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(4);
  });
});

// ============================================================
// AUTH: PASSENGER REGISTRATION
// ============================================================
describe('Auth — Passenger Registration', () => {
  test('POST /api/auth/register/passenger — success', async () => {
    const res = await request(app).post('/api/auth/register/passenger').send({
      fname: 'John',
      lname: 'Doe',
      email: 'passenger@test.com',
      password: 'pass1234',
      contact: '9876543210',
      city: cityId.toString(),
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('role', 'passenger');
    passengerId = res.body.userId;
  });

  test('POST /api/auth/register/passenger — duplicate email fails', async () => {
    const res = await request(app).post('/api/auth/register/passenger').send({
      fname: 'John2',
      lname: 'Doe2',
      email: 'passenger@test.com',
      password: 'pass1234',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('POST /api/auth/register/passenger — missing required fields fails', async () => {
    const res = await request(app).post('/api/auth/register/passenger').send({
      email: 'test2@test.com',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register/passenger — short password fails', async () => {
    const res = await request(app).post('/api/auth/register/passenger').send({
      fname: 'A', lname: 'B', email: 'short@test.com', password: '12',
    });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// AUTH: OTP VERIFICATION
// ============================================================
describe('Auth — OTP Verification', () => {
  test('POST /api/auth/verify-otp — missing fields fails', async () => {
    const res = await request(app).post('/api/auth/verify-otp').send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/verify-otp — wrong OTP fails', async () => {
    const res = await request(app).post('/api/auth/verify-otp').send({
      userId: passengerId, otp: '000000', role: 'passenger',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid OTP/i);
  });

  test('POST /api/auth/verify-otp — correct OTP succeeds', async () => {
    const passenger = await Passenger.findById(passengerId);
    const res = await request(app).post('/api/auth/verify-otp').send({
      userId: passengerId, otp: passenger.otp, role: 'passenger',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/verified/i);
  });

  test('POST /api/auth/verify-otp — already verified fails', async () => {
    const passenger = await Passenger.findById(passengerId);
    const res = await request(app).post('/api/auth/verify-otp').send({
      userId: passengerId, otp: '123456', role: 'passenger',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already verified/i);
  });

  test('POST /api/auth/resend-otp — already verified fails', async () => {
    const res = await request(app).post('/api/auth/resend-otp').send({
      userId: passengerId, role: 'passenger',
    });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// AUTH: DRIVER REGISTRATION
// ============================================================
describe('Auth — Driver Registration', () => {
  test('POST /api/auth/register/driver — success with vehicle', async () => {
    const res = await request(app).post('/api/auth/register/driver').send({
      fname: 'Jane',
      lname: 'Driver',
      email: 'driver@test.com',
      password: 'pass1234',
      contact: '9876543211',
      vehicle: {
        companyName: 'Maruti Suzuki',
        model: 'Swift Dzire',
        fuelType: fuelTypeId.toString(),
        mileage: 22,
        passengerCapacity: 4,
        vehicleNumber: 'MH-12-AB-1234',
      },
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('role', 'driver');
    driverId = res.body.userId;
  });

  test('POST /api/auth/register/driver — missing vehicle fails', async () => {
    const res = await request(app).post('/api/auth/register/driver').send({
      fname: 'X', lname: 'Y', email: 'x@test.com', password: 'pass1234',
    });
    expect(res.status).toBe(400);
  });

  test('Verify driver OTP', async () => {
    const driver = await Driver.findById(driverId);
    const res = await request(app).post('/api/auth/verify-otp').send({
      userId: driverId, otp: driver.otp, role: 'driver',
    });
    expect(res.status).toBe(200);
  });
});

// ============================================================
// AUTH: LOGIN
// ============================================================
describe('Auth — Login', () => {
  test('POST /api/auth/login — passenger login success', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'passenger@test.com', password: 'pass1234', role: 'passenger',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user).toHaveProperty('role', 'passenger');
    passengerToken = res.body.accessToken;
  });

  test('POST /api/auth/login — driver login success', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'driver@test.com', password: 'pass1234', role: 'driver',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    driverToken = res.body.accessToken;
  });

  test('POST /api/auth/login — admin login success', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com', password: 'admin123', role: 'admin',
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    adminToken = res.body.accessToken;
  });

  test('POST /api/auth/login — wrong password fails', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'passenger@test.com', password: 'wrongpass', role: 'passenger',
    });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login — wrong role fails', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'passenger@test.com', password: 'pass1234', role: 'driver',
    });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login — non-existent email fails', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com', password: 'pass1234', role: 'passenger',
    });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login — missing role fails validation', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'passenger@test.com', password: 'pass1234',
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — unverified user gets 403', async () => {
    // Register but don't verify
    await request(app).post('/api/auth/register/passenger').send({
      fname: 'Unverified', lname: 'User', email: 'unverified@test.com', password: 'pass1234',
    });
    const res = await request(app).post('/api/auth/login').send({
      email: 'unverified@test.com', password: 'pass1234', role: 'passenger',
    });
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('userId');
  });
});

// ============================================================
// AUTH: MIDDLEWARE
// ============================================================
describe('Auth Middleware', () => {
  test('Request without token returns 401', async () => {
    const res = await request(app).get('/api/passenger/profile');
    expect(res.status).toBe(401);
  });

  test('Request with invalid token returns 401', async () => {
    const res = await request(app).get('/api/passenger/profile')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });

  test('Passenger cannot access driver routes', async () => {
    const res = await request(app).get('/api/driver/profile')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(403);
  });

  test('Driver cannot access passenger routes', async () => {
    const res = await request(app).get('/api/passenger/profile')
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(403);
  });

  test('Non-admin cannot access admin routes', async () => {
    const res = await request(app).get('/api/admin/stats')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(403);
  });
});

// ============================================================
// AUTH: REFRESH TOKEN & LOGOUT
// ============================================================
describe('Auth — Refresh Token & Logout', () => {
  test('POST /api/auth/refresh-token — without cookie returns 401', async () => {
    const res = await request(app).post('/api/auth/refresh-token');
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/logout — success', async () => {
    const res = await request(app).post('/api/auth/logout')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
  });
});

// ============================================================
// PASSENGER PROFILE
// ============================================================
describe('Passenger Profile', () => {
  test('GET /api/passenger/profile — success', async () => {
    const res = await request(app).get('/api/passenger/profile')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fname', 'John');
    expect(res.body).toHaveProperty('email', 'passenger@test.com');
    expect(res.body).not.toHaveProperty('password');
    expect(res.body).not.toHaveProperty('otp');
  });

  test('PUT /api/passenger/profile — update contact', async () => {
    const res = await request(app).put('/api/passenger/profile')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ contact: '1111111111' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('contact', '1111111111');
  });

  test('PUT /api/passenger/change-password — wrong current password fails', async () => {
    const res = await request(app).put('/api/passenger/change-password')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ currentPassword: 'wrongpass', newPassword: 'newpass123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/incorrect/i);
  });

  test('PUT /api/passenger/change-password — success', async () => {
    const res = await request(app).put('/api/passenger/change-password')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ currentPassword: 'pass1234', newPassword: 'newpass123' });
    expect(res.status).toBe(200);

    // Login with new password should work
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'passenger@test.com', password: 'newpass123', role: 'passenger',
    });
    expect(loginRes.status).toBe(200);
    passengerToken = loginRes.body.accessToken;
  });
});

// ============================================================
// DRIVER PROFILE
// ============================================================
describe('Driver Profile', () => {
  test('GET /api/driver/profile — success', async () => {
    const res = await request(app).get('/api/driver/profile')
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('fname', 'Jane');
    expect(res.body).not.toHaveProperty('password');
  });

  test('PUT /api/driver/profile — update address', async () => {
    const res = await request(app).put('/api/driver/profile')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ address: '123 Driver Street' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('address', '123 Driver Street');
  });

  test('PUT /api/driver/change-password — success', async () => {
    const res = await request(app).put('/api/driver/change-password')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ currentPassword: 'pass1234', newPassword: 'driverpass123' });
    expect(res.status).toBe(200);

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'driver@test.com', password: 'driverpass123', role: 'driver',
    });
    expect(loginRes.status).toBe(200);
    driverToken = loginRes.body.accessToken;
  });
});

// ============================================================
// VEHICLE
// ============================================================
describe('Vehicle Routes', () => {
  test('GET /api/vehicle/my — driver has vehicle from registration', async () => {
    const res = await request(app).get('/api/vehicle/my')
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('companyName', 'Maruti Suzuki');
    expect(res.body).toHaveProperty('model', 'Swift Dzire');
    vehicleId = res.body._id;
  });

  test('POST /api/vehicle — duplicate vehicle registration fails', async () => {
    const res = await request(app).post('/api/vehicle')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        companyName: 'Honda', model: 'City', fuelType: fuelTypeId.toString(),
        mileage: 18, passengerCapacity: 4, vehicleNumber: 'MH-99-ZZ-9999',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  test('PUT /api/vehicle/:id — update vehicle', async () => {
    const res = await request(app).put(`/api/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ mileage: 25 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mileage', 25);
  });

  test('PUT /api/vehicle/:id — other driver cannot update', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).put(`/api/vehicle/${fakeId}`)
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ mileage: 30 });
    expect(res.status).toBe(404);
  });

  test('Passenger cannot access vehicle routes', async () => {
    const res = await request(app).get('/api/vehicle/my')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(403);
  });
});

// ============================================================
// RIDE REQUESTS
// ============================================================
describe('Ride Request Routes', () => {
  test('POST /api/rides — create ride request', async () => {
    const res = await request(app).post('/api/rides')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({
        sourceAddress: 'Andheri West, Mumbai',
        destinationAddress: 'Bandra, Mumbai',
        sourceCity: cityId.toString(),
        destinationCity: cityId.toString(),
        sourceCoords: { lat: 19.1364, lng: 72.8296 },
        destinationCoords: { lat: 19.0596, lng: 72.8295 },
        fromDateTime: new Date(Date.now() + 86400000).toISOString(),
        toDateTime: new Date(Date.now() + 90000000).toISOString(),
        passengerCount: 2,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('status', 'Open');
    rideRequestId = res.body._id;
  });

  test('POST /api/rides — duplicate open request fails', async () => {
    const res = await request(app).post('/api/rides')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({
        sourceAddress: 'Another Place',
        destinationAddress: 'Another Dest',
        fromDateTime: new Date(Date.now() + 86400000).toISOString(),
        toDateTime: new Date(Date.now() + 90000000).toISOString(),
        passengerCount: 1,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already have an open ride/i);
  });

  test('POST /api/rides — toDateTime before fromDateTime fails', async () => {
    // First cancel existing to test this
    await RideRequest.findByIdAndUpdate(rideRequestId, { status: 'Cancelled' });
    const res = await request(app).post('/api/rides')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({
        sourceAddress: 'Place A',
        destinationAddress: 'Place B',
        fromDateTime: new Date(Date.now() + 90000000).toISOString(),
        toDateTime: new Date(Date.now() + 86400000).toISOString(),
        passengerCount: 1,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/after/i);

    // Restore ride request status
    await RideRequest.findByIdAndUpdate(rideRequestId, { status: 'Open' });
  });

  test('GET /api/rides/my — passenger gets own requests', async () => {
    const res = await request(app).get('/api/rides/my')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/rides/available — driver sees open requests', async () => {
    const res = await request(app).get('/api/rides/available')
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('status', 'Open');
  });

  test('GET /api/rides/:id — get single ride request', async () => {
    const res = await request(app).get(`/api/rides/${rideRequestId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('sourceAddress', 'Andheri West, Mumbai');
  });

  test('GET /api/rides/:id — non-existent ride returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/rides/${fakeId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/rides/estimate-cost — works', async () => {
    const res = await request(app)
      .get(`/api/rides/estimate-cost?distance=50&fuelTypeId=${fuelTypeId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('estimatedCost');
    expect(res.body.estimatedCost).toBe(425); // 50 * 8.5
  });

  test('GET /api/rides/estimate-cost — missing params fails', async () => {
    const res = await request(app).get('/api/rides/estimate-cost')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(400);
  });

  test('Driver cannot create ride request', async () => {
    const res = await request(app).post('/api/rides')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        sourceAddress: 'A', destinationAddress: 'B',
        fromDateTime: new Date().toISOString(), toDateTime: new Date().toISOString(),
        passengerCount: 1,
      });
    expect(res.status).toBe(403);
  });
});

// ============================================================
// INTEREST
// ============================================================
describe('Interest Routes', () => {
  test('POST /api/interest — driver expresses interest', async () => {
    const res = await request(app).post('/api/interest')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        rideRequestId: rideRequestId,
        estimatedCost: 350,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('estimatedCost', 350);
    interestId = res.body._id;
  });

  test('POST /api/interest — duplicate interest fails', async () => {
    const res = await request(app).post('/api/interest')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        rideRequestId: rideRequestId,
        estimatedCost: 400,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already expressed/i);
  });

  test('POST /api/interest — non-existent ride fails', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post('/api/interest')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        rideRequestId: fakeId.toString(),
        estimatedCost: 300,
      });
    expect(res.status).toBe(404);
  });

  test('GET /api/interest/ride/:rideId — passenger sees interests', async () => {
    const res = await request(app).get(`/api/interest/ride/${rideRequestId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('estimatedCost', 350);
  });

  test('GET /api/interest/my — driver sees own interests', async () => {
    const res = await request(app).get('/api/interest/my')
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Passenger cannot express interest', async () => {
    const res = await request(app).post('/api/interest')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ rideRequestId: rideRequestId, estimatedCost: 300 });
    expect(res.status).toBe(403);
  });
});

// ============================================================
// BOOKING
// ============================================================
describe('Booking Routes', () => {
  test('POST /api/booking — passenger confirms booking', async () => {
    const res = await request(app).post('/api/booking')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ interestId: interestId });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('rideStatus', 'Ride Booked');
    bookingId = res.body._id;
  });

  test('Ride request status is now Booked', async () => {
    const ride = await RideRequest.findById(rideRequestId);
    expect(ride.status).toBe('Booked');
  });

  test('Schedule was created', async () => {
    const schedule = await Schedule.findOne({ booking: bookingId });
    expect(schedule).toBeTruthy();
    expect(schedule.driver.toString()).toBe(driverId.toString());
  });

  test('POST /api/booking — booking already booked ride fails', async () => {
    const res = await request(app).post('/api/booking')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ interestId: interestId });
    expect(res.status).toBe(400);
  });

  test('GET /api/booking/my — passenger sees bookings', async () => {
    const res = await request(app).get('/api/booking/my')
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/booking/driver — driver sees bookings', async () => {
    const res = await request(app).get('/api/booking/driver')
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/booking/:id — get booking details', async () => {
    const res = await request(app).get(`/api/booking/${bookingId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rideStatus', 'Ride Booked');
  });

  test('Driver cannot book (role restriction)', async () => {
    const res = await request(app).post('/api/booking')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ interestId: interestId });
    expect(res.status).toBe(403);
  });
});

// ============================================================
// RIDE LIFECYCLE: Start → End
// ============================================================
describe('Ride Lifecycle', () => {
  test('PUT /api/booking/:id/start — driver starts ride', async () => {
    const res = await request(app).put(`/api/booking/${bookingId}/start`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rideStatus', 'In Progress');
  });

  test('PUT /api/booking/:id/start — cannot start again', async () => {
    const res = await request(app).put(`/api/booking/${bookingId}/start`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(400);
  });

  test('Passenger cannot start ride', async () => {
    const res = await request(app).put(`/api/booking/${bookingId}/start`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(403);
  });

  test('PUT /api/booking/:id/end — driver ends ride', async () => {
    const res = await request(app).put(`/api/booking/${bookingId}/end`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rideStatus', 'Ride Completed');
  });

  test('PUT /api/booking/:id/end — cannot end again', async () => {
    const res = await request(app).put(`/api/booking/${bookingId}/end`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(400);
  });
});

// ============================================================
// PAYMENT
// ============================================================
describe('Payment Routes', () => {
  test('POST /api/payment — record payment for completed ride', async () => {
    const res = await request(app).post('/api/payment')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: bookingId, transactionId: 'TXN123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('amount', 350);
    expect(res.body).toHaveProperty('transactionId', 'TXN123456');
  });

  test('POST /api/payment — duplicate payment fails', async () => {
    const res = await request(app).post('/api/payment')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: bookingId, transactionId: 'TXN999' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already made/i);
  });

  test('GET /api/payment/booking/:bookingId — get payment', async () => {
    const res = await request(app).get(`/api/payment/booking/${bookingId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('transactionId', 'TXN123456');
  });

  test('GET /api/payment/booking/:id — non-existent returns 404', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/payment/booking/${fakeId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/payment — missing transactionId fails', async () => {
    const res = await request(app).post('/api/payment')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: bookingId });
    expect(res.status).toBe(400);
  });
});

// ============================================================
// FEEDBACK
// ============================================================
describe('Feedback Routes', () => {
  test('POST /api/feedback — submit feedback', async () => {
    const res = await request(app).post('/api/feedback')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: bookingId, description: 'Great ride!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('description', 'Great ride!');
  });

  test('POST /api/feedback — duplicate feedback fails', async () => {
    const res = await request(app).post('/api/feedback')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: bookingId, description: 'Another feedback' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already submitted/i);
  });

  test('POST /api/feedback — without payment fails', async () => {
    // Create a new completed booking without payment
    const ride2 = await RideRequest.create({
      passenger: passengerId, sourceAddress: 'X', destinationAddress: 'Y',
      fromDateTime: new Date(Date.now() + 200000000), toDateTime: new Date(Date.now() + 300000000),
      passengerCount: 1, status: 'Booked',
    });
    const interest2 = await Interest.create({
      rideRequest: ride2._id, vehicle: vehicleId, estimatedCost: 100,
    });
    const booking2 = await Booking.create({
      interest: interest2._id, rideStatus: 'Ride Completed',
    });

    const res = await request(app).post('/api/feedback')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: booking2._id, description: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/payment must be made/i);
  });

  test('GET /api/feedback/booking/:bookingId — get feedback', async () => {
    const res = await request(app).get(`/api/feedback/booking/${bookingId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('description', 'Great ride!');
  });
});

// ============================================================
// BOOKING CANCELLATION
// ============================================================
describe('Booking Cancellation', () => {
  let cancelBookingId;

  beforeAll(async () => {
    // Create another ride + interest + booking for cancellation test
    // Cancel the existing open ride first (if any)
    await RideRequest.updateMany({ passenger: passengerId, status: 'Open' }, { status: 'Cancelled' });

    const ride3 = await RideRequest.create({
      passenger: passengerId, sourceAddress: 'Cancel Source', destinationAddress: 'Cancel Dest',
      fromDateTime: new Date(Date.now() + 400000000), toDateTime: new Date(Date.now() + 500000000),
      passengerCount: 1, status: 'Booked',
    });
    const interest3 = await Interest.create({
      rideRequest: ride3._id, vehicle: vehicleId, estimatedCost: 200,
    });
    const booking3 = await Booking.create({
      interest: interest3._id, rideStatus: 'Ride Booked',
    });
    cancelBookingId = booking3._id;
  });

  test('PUT /api/booking/:id/cancel — authorized user can cancel', async () => {
    const res = await request(app).put(`/api/booking/${cancelBookingId}/cancel`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.booking).toHaveProperty('rideStatus', 'Cancelled');
  });

  test('PUT /api/booking/:id/cancel — cannot cancel completed booking', async () => {
    const res = await request(app).put(`/api/booking/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(400);
  });

  test('PUT /api/booking/:id/cancel — unauthorized user is blocked', async () => {
    // Register a second driver and try to cancel the booking
    const hashed2 = await hashPassword('pass1234');
    const driver2 = await Driver.create({
      fname: 'Other', lname: 'Driver', email: 'other@test.com',
      password: hashed2, isVerified: true,
    });
    const driver2Token = generateTestToken(driver2._id, 'driver', 'other@test.com');

    // Create booking for cancellation auth test
    const ride4 = await RideRequest.create({
      passenger: passengerId, sourceAddress: 'A', destinationAddress: 'B',
      fromDateTime: new Date(Date.now() + 600000000), toDateTime: new Date(Date.now() + 700000000),
      passengerCount: 1, status: 'Booked',
    });
    const interest4 = await Interest.create({
      rideRequest: ride4._id, vehicle: vehicleId, estimatedCost: 150,
    });
    const booking4 = await Booking.create({
      interest: interest4._id, rideStatus: 'Ride Booked',
    });

    const res = await request(app).put(`/api/booking/${booking4._id}/cancel`)
      .set('Authorization', `Bearer ${driver2Token}`);
    expect(res.status).toBe(403);
  });
});

// ============================================================
// RIDE REQUEST CANCELLATION
// ============================================================
describe('Ride Request Cancellation', () => {
  let cancelRideId;

  beforeAll(async () => {
    await RideRequest.updateMany({ passenger: passengerId, status: 'Open' }, { status: 'Cancelled' });
    const ride = await RideRequest.create({
      passenger: passengerId, sourceAddress: 'Del Source', destinationAddress: 'Del Dest',
      fromDateTime: new Date(Date.now() + 800000000), toDateTime: new Date(Date.now() + 900000000),
      passengerCount: 1, status: 'Open',
    });
    cancelRideId = ride._id;
  });

  test('DELETE /api/rides/:id — cancel open ride request', async () => {
    const res = await request(app).delete(`/api/rides/${cancelRideId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/cancelled/i);
  });

  test('DELETE /api/rides/:id — cannot cancel already cancelled ride', async () => {
    const res = await request(app).delete(`/api/rides/${cancelRideId}`)
      .set('Authorization', `Bearer ${passengerToken}`);
    expect(res.status).toBe(400);
  });

  test('DELETE /api/rides/:id — driver cannot cancel passenger ride', async () => {
    const ride5 = await RideRequest.create({
      passenger: passengerId, sourceAddress: 'X', destinationAddress: 'Y',
      fromDateTime: new Date(Date.now() + 1000000000), toDateTime: new Date(Date.now() + 1100000000),
      passengerCount: 1, status: 'Open',
    });
    const res = await request(app).delete(`/api/rides/${ride5._id}`)
      .set('Authorization', `Bearer ${driverToken}`);
    expect(res.status).toBe(403);
  });
});

// ============================================================
// INTEREST: Driver without vehicle
// ============================================================
describe('Interest — Edge Cases', () => {
  test('Driver without vehicle cannot express interest', async () => {
    const hashed = await hashPassword('pass1234');
    const noVehicleDriver = await Driver.create({
      fname: 'No', lname: 'Vehicle', email: 'novehicle@test.com',
      password: hashed, isVerified: true,
    });
    const token = generateTestToken(noVehicleDriver._id, 'driver', 'novehicle@test.com');

    // Need an open ride
    const openRides = await RideRequest.find({ status: 'Open' });
    if (openRides.length === 0) {
      return; // skip if no open rides
    }

    const res = await request(app).post('/api/interest')
      .set('Authorization', `Bearer ${token}`)
      .send({ rideRequestId: openRides[0]._id.toString(), estimatedCost: 300 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/register a vehicle/i);
  });

  test('Interest on non-open ride fails', async () => {
    const closedRide = await RideRequest.findOne({ status: 'Booked' });
    if (!closedRide) return;

    const res = await request(app).post('/api/interest')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ rideRequestId: closedRide._id.toString(), estimatedCost: 300 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/no longer open/i);
  });
});

// ============================================================
// ADMIN ROUTES
// ============================================================
describe('Admin Routes', () => {
  test('GET /api/admin/stats — returns dashboard stats', async () => {
    const res = await request(app).get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPassengers');
    expect(res.body).toHaveProperty('totalDrivers');
    expect(res.body).toHaveProperty('totalRidesCompleted');
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('newRegistrationsThisMonth');
    expect(res.body.totalRidesCompleted).toBeGreaterThanOrEqual(1);
    expect(res.body.totalRevenue).toBeGreaterThanOrEqual(350);
  });

  test('GET /api/admin/passengers — paginated list', async () => {
    const res = await request(app).get('/api/admin/passengers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('passengers');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pages');
    expect(res.body.passengers.length).toBeGreaterThan(0);
  });

  test('GET /api/admin/passengers?search= — search by name', async () => {
    const res = await request(app).get('/api/admin/passengers?search=John')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.passengers.length).toBeGreaterThan(0);
  });

  test('GET /api/admin/drivers — paginated list', async () => {
    const res = await request(app).get('/api/admin/drivers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('drivers');
    expect(res.body.drivers.length).toBeGreaterThan(0);
  });

  test('GET /api/admin/rides — paginated list', async () => {
    const res = await request(app).get('/api/admin/rides')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('rides');
  });

  test('GET /api/admin/rides?status=Open — filter by status', async () => {
    const res = await request(app).get('/api/admin/rides?status=Open')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    for (const ride of res.body.rides) {
      expect(ride.status).toBe('Open');
    }
  });

  test('GET /api/admin/bookings — paginated list', async () => {
    const res = await request(app).get('/api/admin/bookings')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('bookings');
  });

  test('GET /api/admin/report — generates PDF', async () => {
    const res = await request(app).get('/api/admin/report')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
  });

  test('GET /api/admin/report?from=&to= — filtered report', async () => {
    const from = new Date(Date.now() - 86400000 * 30).toISOString();
    const to = new Date().toISOString();
    const res = await request(app).get(`/api/admin/report?from=${from}&to=${to}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/pdf/);
  });
});

// ============================================================
// ADMIN: DELETE USERS (cascading)
// ============================================================
describe('Admin — Delete Users', () => {
  let deletePassengerId, deleteDriverId;

  beforeAll(async () => {
    const hashed = await hashPassword('pass1234');
    const p = await Passenger.create({
      fname: 'Delete', lname: 'Me', email: 'deleteme@test.com', password: hashed, isVerified: true,
    });
    deletePassengerId = p._id;

    const d = await Driver.create({
      fname: 'Delete', lname: 'Driver', email: 'deletedriver@test.com', password: hashed, isVerified: true,
    });
    deleteDriverId = d._id;
    await Vehicle.create({
      driver: deleteDriverId, companyName: 'X', model: 'Y', fuelType: fuelTypeId,
      mileage: 10, passengerCapacity: 2, vehicleNumber: 'XX-00-ZZ-0000',
    });
  });

  test('DELETE /api/admin/passenger/:id — success', async () => {
    const res = await request(app).delete(`/api/admin/passenger/${deletePassengerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const found = await Passenger.findById(deletePassengerId);
    expect(found).toBeNull();
  });

  test('DELETE /api/admin/passenger/:id — non-existent returns 404', async () => {
    const res = await request(app).delete(`/api/admin/passenger/${deletePassengerId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  test('DELETE /api/admin/driver/:id — success with cascade', async () => {
    const res = await request(app).delete(`/api/admin/driver/${deleteDriverId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const foundDriver = await Driver.findById(deleteDriverId);
    const foundVehicle = await Vehicle.findOne({ driver: deleteDriverId });
    expect(foundDriver).toBeNull();
    expect(foundVehicle).toBeNull();
  });
});

// ============================================================
// PAYMENT: Edge case — payment on non-completed ride
// ============================================================
describe('Payment — Edge Cases', () => {
  test('Payment on non-completed ride fails', async () => {
    const ride = await RideRequest.create({
      passenger: passengerId, sourceAddress: 'A', destinationAddress: 'B',
      fromDateTime: new Date(Date.now() + 2000000000), toDateTime: new Date(Date.now() + 2100000000),
      passengerCount: 1, status: 'Booked',
    });
    const interest = await Interest.create({
      rideRequest: ride._id, vehicle: vehicleId, estimatedCost: 100,
    });
    const booking = await Booking.create({
      interest: interest._id, rideStatus: 'Ride Booked',
    });

    const res = await request(app).post('/api/payment')
      .set('Authorization', `Bearer ${passengerToken}`)
      .send({ bookingId: booking._id.toString(), transactionId: 'TXNFAIL' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/completed/i);
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================
describe('Health Check', () => {
  test('GET /api/health — returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});
