const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const FuelRegistry = require('../models/FuelRegistry');
const connectDB = require('../config/db');

const fuelTypes = [
  { fuelType: 'Petrol', pricePerKm: 8.5 },
  { fuelType: 'Diesel', pricePerKm: 7.0 },
  { fuelType: 'CNG', pricePerKm: 5.0 },
  { fuelType: 'Electric', pricePerKm: 3.0 },
];

const seed = async () => {
  await connectDB();
  await FuelRegistry.deleteMany({});
  await FuelRegistry.insertMany(fuelTypes);
  console.log(`Seeded ${fuelTypes.length} fuel types`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
