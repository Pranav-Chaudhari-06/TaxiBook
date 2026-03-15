# Taxi Booking System — MERN Stack Rebuild Specification

## Claude Code Prompt

> **Copy and paste this prompt to Claude Code to start the project:**
>
> ```
> Build a full-stack Taxi Booking System using the MERN stack (MongoDB, Express.js, React.js, Node.js).
> This is a ride-sharing platform like Uber/Ola targeting India with three user roles: Passenger, Driver, and Admin.
> Follow the full specification in MERN_REBUILD_SPEC.md exactly. Use the folder structure, MongoDB schemas,
> API routes, and feature list defined there. Start by scaffolding the project, then implement backend first
> (models → routes → controllers), then frontend (pages → components). Use JWT for auth, bcrypt for passwords,
> Mongoose for DB, Nodemailer for emails, Multer for file uploads, and Tailwind CSS + shadcn/ui for styling.
> Integrate HERE Maps API for route visualization and distance calculation.
> ```

---

## 1. Project Overview

A full-stack taxi booking web application allowing passengers to request rides, drivers to accept them, and admins to oversee the platform. India-specific with support for 32 states and thousands of cities.

**Roles:**
- **Passenger** — Request rides, pick drivers, pay, give feedback
- **Driver** — Register vehicle, browse ride requests, express interest, start/end rides
- **Admin** — View stats, manage users, generate reports

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, shadcn/ui |
| State Management | Redux Toolkit + RTK Query |
| Maps | HERE Maps API v3.1 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (access + refresh tokens) |
| File Uploads | Multer + Cloudinary (or local `/uploads`) |
| Email | Nodemailer (Gmail SMTP) |
| PDF Reports | Puppeteer or pdfkit |
| Password Hashing | bcrypt |
| Validation | Joi (backend) + React Hook Form + Zod (frontend) |
| Dev Tools | Vite, ESLint, Prettier, dotenv, concurrently |

---

## 3. Folder Structure

```
taxi-booking-system/
├── client/                          # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js             # Redux store
│   │   ├── assets/                  # Images, icons
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Footer, Loader, Modal, ProtectedRoute
│   │   │   ├── maps/                # HereMap, RouteDisplay, LocationPicker
│   │   │   ├── passenger/           # RideRequestForm, BookingCard, DriverCard, FeedbackForm
│   │   │   ├── driver/              # RideRequestList, InterestCard, RideStatusPanel
│   │   │   └── admin/               # StatsCard, UserTable, ReportPanel
│   │   ├── features/
│   │   │   ├── auth/                # authSlice, authApi
│   │   │   ├── rides/               # ridesSlice, ridesApi
│   │   │   ├── users/               # usersSlice, usersApi
│   │   │   └── admin/               # adminSlice, adminApi
│   │   ├── hooks/                   # useAuth, useMap, useDebounce
│   │   ├── pages/
│   │   │   ├── shared/              # Login, Register, OTPVerify, NotFound
│   │   │   ├── passenger/           # Home, RequestRide, BookedRide, InterestPage, Feedback, Profile, MakePayment
│   │   │   ├── driver/              # Home, ViewRequests, ConfirmBooking, RideActive, Profile, RegisterVehicle
│   │   │   └── admin/               # Dashboard, Users, Rides, Reports
│   │   ├── utils/                   # axios instance, formatDate, calcCost, constants
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                          # Express backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── cloudinary.js            # Cloudinary config (optional)
│   │   └── nodemailer.js            # Email transporter
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── passengerController.js
│   │   ├── driverController.js
│   │   ├── vehicleController.js
│   │   ├── rideController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── feedbackController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js                  # verifyToken, requireRole
│   │   ├── upload.js                # Multer config
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Passenger.js
│   │   ├── Driver.js
│   │   ├── Vehicle.js
│   │   ├── FuelRegistry.js
│   │   ├── State.js
│   │   ├── City.js
│   │   ├── RideRequest.js
│   │   ├── Interest.js
│   │   ├── Booking.js
│   │   ├── Schedule.js
│   │   ├── Payment.js
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── passenger.js
│   │   ├── driver.js
│   │   ├── vehicle.js
│   │   ├── ride.js
│   │   ├── booking.js
│   │   ├── payment.js
│   │   ├── feedback.js
│   │   ├── location.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── sendOTP.js               # Generate & email OTP
│   │   ├── costEstimation.js        # Fare calculation logic
│   │   ├── generateReport.js        # PDF generation
│   │   └── sendCancelEmail.js       # Cancellation email
│   ├── seeds/
│   │   ├── seedStates.js            # Seed 32 Indian states
│   │   ├── seedCities.js            # Seed 3000+ Indian cities
│   │   └── seedFuel.js              # Seed fuel types and rates
│   ├── app.js                       # Express app setup
│   └── server.js                    # Entry point
│
├── .env
├── .gitignore
└── package.json                     # Root package with concurrently scripts
```

---

## 4. Environment Variables (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/taxi_booking

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=TaxiApp <your_email@gmail.com>

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# HERE Maps (used on frontend via Vite env)
VITE_HERE_API_KEY=your_here_maps_api_key

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 5. MongoDB Schemas

### Admin
```js
{
  name: String,
  email: { type: String, unique: true },
  password: String,   // bcrypt hashed
  createdAt: Date
}
```

### Passenger
```js
{
  fname: String,
  mname: String,
  lname: String,
  email: { type: String, unique: true },
  password: String,
  dob: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  contact: String,
  address: String,
  city: { type: ObjectId, ref: 'City' },
  image: String,           // URL or local path
  isVerified: Boolean,     // OTP email verified
  otp: String,
  otpExpiry: Date,
  createdAt: Date
}
```

### Driver
```js
{
  fname: String,
  mname: String,
  lname: String,
  email: { type: String, unique: true },
  password: String,
  dob: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  contact: String,
  address: String,
  city: { type: ObjectId, ref: 'City' },
  image: String,
  isVerified: Boolean,
  otp: String,
  otpExpiry: Date,
  createdAt: Date
}
```

### Vehicle
```js
{
  driver: { type: ObjectId, ref: 'Driver', required: true },
  companyName: String,
  model: String,
  fuelType: { type: ObjectId, ref: 'FuelRegistry' },
  mileage: Number,
  passengerCapacity: Number,
  vehicleNumber: String,
  vehiclePermit: String,
  vehicleInsurance: String,
  createdAt: Date
}
```

### FuelRegistry
```js
{
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG', 'Electric'] },
  pricePerKm: Number
}
```

### State
```js
{
  stateName: String
}
```

### City
```js
{
  cityName: String,
  state: { type: ObjectId, ref: 'State' }
}
```

### RideRequest
```js
{
  passenger: { type: ObjectId, ref: 'Passenger', required: true },
  sourceAddress: String,
  destinationAddress: String,
  sourceCity: { type: ObjectId, ref: 'City' },
  destinationCity: { type: ObjectId, ref: 'City' },
  sourceCoords: { lat: Number, lng: Number },
  destinationCoords: { lat: Number, lng: Number },
  fromDateTime: Date,
  toDateTime: Date,
  passengerCount: Number,
  status: { type: String, enum: ['Open', 'Booked', 'Cancelled'], default: 'Open' },
  createdAt: Date
}
```

### Interest
```js
{
  rideRequest: { type: ObjectId, ref: 'RideRequest', required: true },
  vehicle: { type: ObjectId, ref: 'Vehicle', required: true },
  estimatedCost: Number,
  createdAt: Date
}
```

### Booking
```js
{
  interest: { type: ObjectId, ref: 'Interest', required: true },
  rideStatus: {
    type: String,
    enum: ['Ride Booked', 'In Progress', 'Ride Completed', 'Cancelled'],
    default: 'Ride Booked'
  },
  createdAt: Date
}
```

### Schedule
```js
{
  booking: { type: ObjectId, ref: 'Booking', required: true },
  driver: { type: ObjectId, ref: 'Driver', required: true },
  fromDate: Date,
  toDate: Date
}
```

### Payment
```js
{
  booking: { type: ObjectId, ref: 'Booking', required: true },
  transactionId: String,
  amount: Number,
  paidAt: Date
}
```

### Feedback
```js
{
  booking: { type: ObjectId, ref: 'Booking', required: true },
  description: String,
  createdAt: Date
}
```

---

## 6. API Routes

### Auth (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register/passenger` | Register passenger | Public |
| POST | `/register/driver` | Register driver | Public |
| POST | `/verify-otp` | Verify OTP | Public |
| POST | `/resend-otp` | Resend OTP | Public |
| POST | `/login` | Login (all roles) | Public |
| POST | `/logout` | Logout | Auth |
| POST | `/refresh-token` | Refresh JWT | Public |

### Passenger (`/api/passenger`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get own profile | Passenger |
| PUT | `/profile` | Update profile + image | Passenger |
| PUT | `/change-password` | Change password | Passenger |

### Driver (`/api/driver`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/profile` | Get own profile | Driver |
| PUT | `/profile` | Update profile + image | Driver |
| PUT | `/change-password` | Change password | Driver |

### Vehicle (`/api/vehicle`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Register vehicle | Driver |
| GET | `/my` | Get driver's vehicle | Driver |
| PUT | `/:id` | Update vehicle | Driver |

### Ride Requests (`/api/rides`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create ride request | Passenger |
| GET | `/my` | Passenger's own requests | Passenger |
| GET | `/available` | All open requests | Driver |
| GET | `/:id` | Single ride request | Auth |
| DELETE | `/:id` | Cancel ride request | Passenger |
| GET | `/estimate-cost` | Cost estimation (query params) | Auth |

### Interest (`/api/interest`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Driver expresses interest | Driver |
| GET | `/ride/:rideId` | Get all interests for a ride | Passenger |
| GET | `/my` | Driver's submitted interests | Driver |
| DELETE | `/:id` | Withdraw interest | Driver |

### Booking (`/api/booking`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Confirm booking (pick driver) | Passenger |
| GET | `/my` | Passenger's bookings | Passenger |
| GET | `/driver` | Driver's bookings | Driver |
| GET | `/:id` | Single booking details | Auth |
| PUT | `/:id/start` | Start ride | Driver |
| PUT | `/:id/end` | End ride | Driver |
| PUT | `/:id/cancel` | Cancel booking | Passenger/Driver |

### Payment (`/api/payment`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Record payment | Passenger |
| GET | `/booking/:bookingId` | Get payment for booking | Auth |

### Feedback (`/api/feedback`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Submit feedback | Passenger |
| GET | `/booking/:bookingId` | Get feedback for booking | Auth |

### Location (`/api/location`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/states` | Get all states | Public |
| GET | `/cities/:stateId` | Get cities by state | Public |
| GET | `/cities/search?q=` | Search cities | Public |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/stats` | Dashboard stats | Admin |
| GET | `/passengers` | All passengers | Admin |
| GET | `/drivers` | All drivers | Admin |
| GET | `/rides` | All rides | Admin |
| GET | `/bookings` | All bookings | Admin |
| DELETE | `/passenger/:id` | Delete passenger | Admin |
| DELETE | `/driver/:id` | Delete driver | Admin |
| GET | `/report` | Generate PDF report | Admin |

---

## 7. Frontend Pages & Routes

### React Router Configuration

```
/                          → redirect based on role
/login                     → Login (all roles)
/register                  → Register type selector
/register/passenger        → Passenger registration
/register/driver           → Driver registration + vehicle
/verify-otp               → OTP verification

/passenger/
  home                     → Dashboard (active bookings, quick actions)
  request-ride             → Request ride form with HERE Maps
  bookings                 → View all bookings
  bookings/:id             → Booking detail + driver info
  interests/:rideId        → View interested drivers, pick one
  payment/:bookingId       → Make payment
  feedback/:bookingId      → Submit feedback
  profile                  → View/edit profile

/driver/
  home                     → Dashboard (active booking, earnings)
  requests                 → Browse open ride requests
  bookings                 → Driver's confirmed bookings
  ride/:bookingId          → Active ride panel (start/end)
  profile                  → View/edit profile

/admin/
  dashboard                → Stats overview
  passengers               → Passenger table
  drivers                  → Driver table
  rides                    → Ride requests table
  bookings                 → Bookings table
  reports                  → Generate & download PDF report
```

---

## 8. Feature Specifications

### 8.1 Registration & OTP Verification

- Separate registration forms for Passenger and Driver
- Driver registration includes vehicle details form (same flow)
- On submit: hash password, save user with `isVerified: false`, generate 6-digit OTP, send via Nodemailer
- OTP page: user enters OTP, verified within 10 minutes, `isVerified` set to `true`
- Resend OTP option after 30 seconds
- Duplicate email check before saving

### 8.2 Authentication (JWT)

- Login returns `accessToken` (15min) + `refreshToken` (7 days, stored in httpOnly cookie)
- Access token stored in Redux state (memory, not localStorage)
- RTK Query automatically refreshes token on 401
- Role decoded from token payload: `{ id, role, email }`
- `ProtectedRoute` component checks role and redirects if unauthorized

### 8.3 Ride Request (Passenger)

- Form fields: source address, destination address, source city, destination city, from date/time, to date/time, passenger count
- HERE Maps displays route between source and destination coordinates
- Distance calculated via HERE Routing API
- Cost estimated: `distance × fuelPricePerKm` (based on available driver vehicles' fuel types)
- Validation: passenger cannot have more than 1 open ride request at a time (checked via `checkRequest`)
- Submit creates a `RideRequest` with `status: 'Open'`

### 8.4 Driver Interest System

- Driver sees all `RideRequest` documents with `status: 'Open'`
- Cards show: source → destination, date/time, passenger count, estimated cost
- Driver clicks "Express Interest" → creates `Interest` document linked to their vehicle
- Driver can withdraw interest if not yet booked
- Driver cannot express interest in the same ride twice

### 8.5 Booking Confirmation (Passenger)

- Passenger views `Interest` list for their ride request
- Each card shows: driver name, vehicle model, fuel type, capacity, estimated cost
- Passenger selects one → `POST /api/booking`
  - Creates `Booking` with `status: 'Ride Booked'`
  - Creates `Schedule` with dates from the ride request
  - Deletes all other `Interest` documents for that ride request
  - Updates `RideRequest.status` to `'Booked'`

### 8.6 Ride Lifecycle

```
Ride Booked → In Progress → Ride Completed
                         ↘ Cancelled
```

- Driver sees confirmed booking on dashboard
- "Start Ride" button → `PUT /api/booking/:id/start` → status: `'In Progress'`
- "End Ride" button → `PUT /api/booking/:id/end` → status: `'Ride Completed'`
- Either party can cancel → `PUT /api/booking/:id/cancel` → status: `'Cancelled'`
  - Cancellation triggers email to both passenger and driver via Nodemailer

### 8.7 Payment

- After ride completed, passenger sees "Make Payment" button
- Enter transaction ID (manual/mock payment)
- `POST /api/payment` creates payment record
- Amount pulled from `Interest.estimatedCost`

### 8.8 Feedback

- After payment, "Leave Feedback" button appears
- Text area for description
- `POST /api/feedback` linked to booking

### 8.9 Cost Estimation

```
estimatedCost = (distance_km / vehicle.mileage) × fuel.pricePerLitre
             OR
estimatedCost = distance_km × fuel.pricePerKm
```

- Exposed as `GET /api/rides/estimate-cost?distance=50&fuelTypeId=xxx`
- Also shown live on the ride request form as the user sets source/destination

### 8.10 Admin Dashboard

Stats shown:
- Total passengers
- Total drivers
- New registrations this month (passengers + drivers)
- Total rides completed
- Total revenue (sum of all `Payment.amount`)

Tables:
- Paginated DataTable for passengers, drivers, rides, bookings
- Search and filter by status, date, city

### 8.11 PDF Report Generation (Admin)

- Endpoint: `GET /api/admin/report?from=&to=`
- Uses `pdfkit` or `puppeteer` to generate report containing:
  - Date range
  - Total bookings, completed, cancelled
  - Revenue breakdown
  - New user registrations
- Returns PDF as download

### 8.12 HERE Maps Integration

- Used on: Request Ride page, Booking Detail page, Active Ride page
- Features:
  - Geocoding: convert address/city to lat/lng
  - Route rendering: draw polyline between source and destination
  - Distance extraction from routing response
  - Marker placement for source (green) and destination (red)
- API key loaded from `import.meta.env.VITE_HERE_API_KEY`

### 8.13 Profile Management

Both passengers and drivers can:
- View profile details
- Update name, contact, address, city
- Upload profile picture (Multer → Cloudinary or local `/uploads`)
- Change password (verify old password before updating)

### 8.14 Location (States & Cities)

- Seeded from original `cms.sql` data (32 states, 3000+ cities)
- Seed scripts in `server/seeds/`
- Cascading dropdowns: select state → city list populates
- Searchable city dropdown on ride request form

---

## 9. Security Requirements

- All passwords hashed with bcrypt (saltRounds: 12)
- JWT stored in memory (access token) and httpOnly cookie (refresh token)
- All protected routes require valid JWT via `verifyToken` middleware
- Role-based access via `requireRole('passenger' | 'driver' | 'admin')` middleware
- Input validation with Joi on all POST/PUT endpoints
- Helmet.js for HTTP security headers
- CORS configured to allow only `CLIENT_URL`
- Rate limiting on `/api/auth` endpoints (express-rate-limit)
- File upload restricted to images only, max 5MB (Multer)
- MongoDB injection prevention via Mongoose schema types

---

## 10. Additional Libraries

### Backend
```json
{
  "express": "^4.18",
  "mongoose": "^8",
  "bcryptjs": "^2.4",
  "jsonwebtoken": "^9",
  "nodemailer": "^6",
  "multer": "^1.4",
  "joi": "^17",
  "helmet": "^7",
  "cors": "^2",
  "express-rate-limit": "^7",
  "dotenv": "^16",
  "pdfkit": "^0.14",
  "cookie-parser": "^1.4",
  "morgan": "^1.10"
}
```

### Frontend
```json
{
  "react": "^18",
  "react-dom": "^18",
  "react-router-dom": "^6",
  "@reduxjs/toolkit": "^2",
  "react-redux": "^9",
  "axios": "^1",
  "react-hook-form": "^7",
  "zod": "^3",
  "@hookform/resolvers": "^3",
  "tailwindcss": "^3",
  "lucide-react": "^0.400",
  "date-fns": "^3",
  "react-hot-toast": "^2",
  "react-datepicker": "^6"
}
```

---

## 11. Build Order (Recommended)

1. **Project setup** — Initialize monorepo, install dependencies, configure Vite + Tailwind
2. **Database** — Connect MongoDB, write all Mongoose models
3. **Seeds** — Seed states, cities, fuel registry
4. **Auth** — Register, OTP, login, JWT middleware
5. **Backend routes** — Location → Passenger/Driver/Vehicle → Rides → Interest → Booking → Payment → Feedback → Admin
6. **Frontend auth** — Login, Register, OTP pages + Redux auth slice
7. **Passenger pages** — Home → Request Ride (with HERE Maps) → Interests → Booking → Payment → Feedback → Profile
8. **Driver pages** — Home → View Requests → Booking management → Active Ride → Profile
9. **Admin pages** — Dashboard → Tables → Report generation
10. **Polish** — Loading states, error boundaries, toast notifications, responsive design

---

## 12. Original System Reference

The original system was built in PHP + MySQL (XAMPP). Key behavioral rules to preserve:

- A passenger can only have **one open ride request at a time**
- When a booking is confirmed, **all other interests for that ride are deleted**
- Ride status must flow in order: `Booked → In Progress → Completed` (no skipping)
- Cancellation sends **email to both parties**
- Admin report covers **all-time or filtered by date range**
- Driver must register a vehicle **before** being able to express interest in rides
- OTP expires in **10 minutes**
- Cities are **India-specific** (seeded from original MySQL data)
