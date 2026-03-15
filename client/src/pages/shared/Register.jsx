import { Link } from 'react-router-dom';
import { UserPlus, Car as CarIcon, ChevronRight } from 'lucide-react';

const Register = () => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg w-full text-center animate-slide-up">
        <h1 className="page-title mb-2">Create an Account</h1>
        <p className="text-surface-400 mb-10">Choose your account type to get started</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link to="/register/passenger" className="card-interactive text-center group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-4 group-hover:from-primary-200 group-hover:to-primary-100 transition-all duration-300 shadow-sm">
              <UserPlus className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-bold text-surface-800 mb-1">Passenger</h3>
            <p className="text-sm text-surface-400 mb-3">Book rides and travel across India</p>
            <span className="inline-flex items-center text-xs font-semibold text-primary-600 group-hover:gap-1.5 gap-1 transition-all duration-200">
              Get started <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link to="/register/driver" className="card-interactive text-center group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mx-auto mb-4 group-hover:from-emerald-200 group-hover:to-emerald-100 transition-all duration-300 shadow-sm">
              <CarIcon className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="font-bold text-surface-800 mb-1">Driver</h3>
            <p className="text-sm text-surface-400 mb-3">Register your vehicle and earn</p>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 group-hover:gap-1.5 gap-1 transition-all duration-200">
              Get started <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        <p className="text-sm text-surface-400 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
