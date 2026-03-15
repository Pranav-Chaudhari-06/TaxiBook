import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRegisterPassengerMutation } from '../../features/auth/authApi';
import { useGetStatesQuery, useGetCitiesQuery } from '../../features/auth/authApi';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';

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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterPassenger = () => {
  const navigate = useNavigate();
  const [registerPassenger, { isLoading }] = useRegisterPassengerMutation();
  const { data: states } = useGetStatesQuery();
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { data: cities } = useGetCitiesQuery(selectedState, { skip: !selectedState });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const { confirmPassword, ...rest } = data;
    try {
      const result = await registerPassenger({
        ...rest,
        city: selectedCity || undefined,
      }).unwrap();
      toast.success(result.message);
      navigate('/verify-otp', { state: { userId: result.userId, role: 'passenger' } });
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-slide-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="page-title">Register as Passenger</h1>
          <p className="text-surface-400 text-sm">Create your account to start booking rides</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-surface-400 mt-6">
        Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Login</Link>
      </p>
    </div>
  );
};

export default RegisterPassenger;
