import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Car, ChevronRight } from 'lucide-react';
import { useLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
  role: z.enum(['passenger', 'driver', 'admin']),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'passenger' },
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));

      const role = result.user.role;
      if (role === 'passenger') navigate('/passenger/home');
      else if (role === 'driver') navigate('/driver/home');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      if (err?.data?.userId) {
        toast.error(err.data.message);
        navigate('/verify-otp', { state: { userId: err.data.userId, role: err.data.role } });
      } else {
        toast.error(err?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />
      </div>

      <div className="card max-w-md w-full animate-slide-up">
        <div className="flex items-center gap-2.5 justify-center mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25">
            <Car className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold gradient-text">TaxiBook</h1>
        </div>

        <p className="text-center text-surface-400 text-sm mb-8">Login to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="label">I am a</label>
            <select {...register('role')} className="input-field">
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="label">Email</label>
            <input type="email" {...register('email')} className="input-field" placeholder="your@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" {...register('password')} className="input-field" placeholder="Enter password" />
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Logging in...' : 'Login'}
            {!isLoading && <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </form>

        <p className="text-center text-sm text-surface-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
