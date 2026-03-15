import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRegisterDriverMutation, useGetStatesQuery, useGetCitiesQuery } from '../../features/auth/authApi';
import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { User, Car } from 'lucide-react';

const schema = z.object({
  fname: z.string().min(1, 'First name required'),
  mname: z.string().optional(),
  lname: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
  confirmPassword: z.string(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
  // Vehicle fields
  companyName: z.string().min(1, 'Company name required'),
  model: z.string().min(1, 'Model required'),
  fuelType: z.string().min(1, 'Fuel type required'),
  mileage: z.string().min(1, 'Mileage required'),
  passengerCapacity: z.string().min(1, 'Capacity required'),
  vehicleNumber: z.string().min(1, 'Vehicle number required'),
  vehiclePermit: z.string().optional(),
  vehicleInsurance: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterDriver = () => {
  const navigate = useNavigate();
  const [registerDriver, { isLoading }] = useRegisterDriverMutation();
  const { data: states } = useGetStatesQuery();
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { data: cities } = useGetCitiesQuery(selectedState, { skip: !selectedState });
  const [fuelTypes, setFuelTypes] = useState([]);

  useEffect(() => {
    const fetchFuel = async () => {
      try {
        const res = await fetch('/api/location/fuel-types');
        if (!res.ok) return;
        const data = await res.json();
        setFuelTypes(data);
      } catch {
        // fuel types route may not exist, use static
        setFuelTypes([
          { _id: 'petrol', fuelType: 'Petrol' },
          { _id: 'diesel', fuelType: 'Diesel' },
          { _id: 'cng', fuelType: 'CNG' },
          { _id: 'electric', fuelType: 'Electric' },
        ]);
      }
    };
    fetchFuel();
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const { confirmPassword, companyName, model, fuelType, mileage, passengerCapacity, vehicleNumber, vehiclePermit, vehicleInsurance, ...rest } = data;
    try {
      const result = await registerDriver({
        ...rest,
        city: selectedCity || undefined,
        vehicle: {
          companyName,
          model,
          fuelType,
          mileage: parseFloat(mileage),
          passengerCapacity: parseInt(passengerCapacity),
          vehicleNumber,
          vehiclePermit: vehiclePermit || '',
          vehicleInsurance: vehicleInsurance || '',
        },
      }).unwrap();
      toast.success(result.message);
      navigate('/verify-otp', { state: { userId: result.userId, role: 'driver' } });
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-slide-up">
      <h1 className="page-title text-center mb-2">Register as Driver</h1>
      <p className="text-center text-surface-500 mb-8">Create your driver account and start accepting rides</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Details Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-400/30">
            <div className="bg-gradient-to-br from-primary-100 to-primary-50 w-10 h-10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="section-title mb-0">Personal Details</h2>
              <p className="text-surface-500 text-sm">Your basic information and credentials</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input {...register('fname')} className="input-field" />
                {errors.fname && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fname.message}</p>}
              </div>
              <div>
                <label className="label">Middle Name</label>
                <input {...register('mname')} className="input-field" />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input {...register('lname')} className="input-field" />
                {errors.lname && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.lname.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email *</label>
              <input type="email" {...register('email')} className="input-field" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <input type="password" {...register('password')} className="input-field" />
                {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" {...register('confirmPassword')} className="input-field" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" {...register('dob')} className="input-field" />
              </div>
              <div>
                <label className="label">Gender</label>
                <select {...register('gender')} className="input-field">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Contact</label>
                <input {...register('contact')} className="input-field" />
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <input {...register('address')} className="input-field" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">State</label>
                <select className="input-field" value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}>
                  <option value="">Select state</option>
                  {states?.map((s) => <option key={s._id} value={s._id}>{s.stateName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">City</label>
                <select className="input-field" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
                  <option value="">Select city</option>
                  {cities?.map((c) => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-400/30">
            <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="section-title mb-0">Vehicle Details</h2>
              <p className="text-surface-500 text-sm">Information about your vehicle</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name *</label>
                <input {...register('companyName')} className="input-field" placeholder="e.g. Maruti Suzuki" />
                {errors.companyName && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.companyName.message}</p>}
              </div>
              <div>
                <label className="label">Model *</label>
                <input {...register('model')} className="input-field" placeholder="e.g. Swift Dzire" />
                {errors.model && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.model.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Fuel Type *</label>
                <select {...register('fuelType')} className="input-field">
                  <option value="">Select</option>
                  {fuelTypes.map((f) => (
                    <option key={f._id} value={f._id}>{f.fuelType}</option>
                  ))}
                </select>
                {errors.fuelType && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.fuelType.message}</p>}
              </div>
              <div>
                <label className="label">Mileage (km/l) *</label>
                <input type="number" {...register('mileage')} className="input-field" />
                {errors.mileage && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.mileage.message}</p>}
              </div>
              <div>
                <label className="label">Passenger Capacity *</label>
                <input type="number" {...register('passengerCapacity')} className="input-field" />
                {errors.passengerCapacity && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.passengerCapacity.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Vehicle Number *</label>
              <input {...register('vehicleNumber')} className="input-field" placeholder="e.g. MH-12-AB-1234" />
              {errors.vehicleNumber && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.vehicleNumber.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Vehicle Permit</label>
                <input {...register('vehiclePermit')} className="input-field" />
              </div>
              <div>
                <label className="label">Vehicle Insurance</label>
                <input {...register('vehicleInsurance')} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="text-center text-sm text-surface-500 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Login</Link>
      </p>
    </div>
  );
};

export default RegisterDriver;
