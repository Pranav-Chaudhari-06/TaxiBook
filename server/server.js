const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const connectDB = require('./config/db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
};

start();
