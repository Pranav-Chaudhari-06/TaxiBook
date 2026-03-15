const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let mongoServer;

// Set env vars for testing
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.EMAIL_USER = 'test@test.com';
process.env.EMAIL_PASS = 'test';
process.env.EMAIL_FROM = 'Test <test@test.com>';

const connectTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
};

const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Helper to generate a JWT token for testing
const generateTestToken = (userId, role, email = 'test@test.com') => {
  return jwt.sign(
    { id: userId.toString(), role, email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Helper to create a hashed password
const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

module.exports = {
  connectTestDB,
  disconnectTestDB,
  clearDB,
  generateTestToken,
  hashPassword,
};
