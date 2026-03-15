import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogOut, Car, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../features/auth/authApi';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, isPassenger, isDriver, isAdmin } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutApi] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // proceed with logout regardless
    }
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [];
  if (isPassenger) {
    navLinks.push(
      { to: '/passenger/home', label: 'Home' },
      { to: '/passenger/request-ride', label: 'Request Ride' },
      { to: '/passenger/bookings', label: 'Bookings' },
      { to: '/passenger/profile', label: 'Profile' }
    );
  } else if (isDriver) {
    navLinks.push(
      { to: '/driver/home', label: 'Home' },
      { to: '/driver/requests', label: 'Ride Requests' },
      { to: '/driver/bookings', label: 'Bookings' },
      { to: '/driver/profile', label: 'Profile' }
    );
  } else if (isAdmin) {
    navLinks.push(
      { to: '/admin/dashboard', label: 'Dashboard' },
      { to: '/admin/passengers', label: 'Passengers' },
      { to: '/admin/drivers', label: 'Drivers' },
      { to: '/admin/rides', label: 'Rides' },
      { to: '/admin/bookings', label: 'Bookings' },
      { to: '/admin/reports', label: 'Reports' }
    );
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-400 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/25 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow duration-200">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold gradient-text tracking-tight">TaxiBook</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-surface-500 hover:text-surface-800 hover:bg-surface-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-surface-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-surface-600 hidden lg:block">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="btn-ghost text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden flex items-center p-2 rounded-xl hover:bg-surface-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5 text-surface-600" /> : <Menu className="w-5 h-5 text-surface-600" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 animate-slide-down">
            <div className="space-y-1">
              {isAuthenticated ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive(link.to)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-surface-600 hover:bg-surface-100'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <hr className="my-2 border-surface-100" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-surface-600 hover:bg-surface-100" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-primary-600 hover:bg-primary-50" onClick={() => setMenuOpen(false)}>
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
