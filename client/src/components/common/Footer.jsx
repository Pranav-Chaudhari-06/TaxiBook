import { Car, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-white">TaxiBook</span>
            </div>
            <p className="text-surface-400 text-sm leading-relaxed">
              India's trusted ride-sharing platform. Travel safely, comfortably, and affordably across the country.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/register" className="text-surface-400 hover:text-primary-400 transition-colors">Register</a></li>
              <li><a href="/login" className="text-surface-400 hover:text-primary-400 transition-colors">Login</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-surface-400">
                <Mail className="w-4 h-4 text-primary-400" />
                support@taxibook.in
              </li>
              <li className="flex items-center gap-2 text-surface-400">
                <MapPin className="w-4 h-4 text-primary-400" />
                India
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-800 pt-6 text-center">
          <p className="text-surface-500 text-sm">
            &copy; {new Date().getFullYear()} TaxiBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
