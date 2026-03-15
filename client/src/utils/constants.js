export const RIDE_STATUS = {
  OPEN: 'Open',
  BOOKED: 'Booked',
  CANCELLED: 'Cancelled',
};

export const BOOKING_STATUS = {
  RIDE_BOOKED: 'Ride Booked',
  IN_PROGRESS: 'In Progress',
  RIDE_COMPLETED: 'Ride Completed',
  CANCELLED: 'Cancelled',
};

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];

export const STATUS_COLORS = {
  Open: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  Booked: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  Cancelled: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  'Ride Booked': 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  'In Progress': 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  'Ride Completed': 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};
