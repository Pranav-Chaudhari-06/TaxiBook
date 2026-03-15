import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail } from 'lucide-react';
import { useVerifyOTPMutation, useResendOTPMutation } from '../../features/auth/authApi';

const OTPVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, role } = location.state || {};

  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [verifyOTP, { isLoading: verifying }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: resending }] = useResendOTPMutation();

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Enter a valid 6-digit OTP');
      return;
    }
    try {
      const result = await verifyOTP({ userId, otp, role }).unwrap();
      toast.success(result.message);
      navigate('/login');
    } catch (err) {
      toast.error(err?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ userId, role }).unwrap();
      toast.success('OTP resent!');
      setCountdown(30);
      setCanResend(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-slide-up">
      <div className="card max-w-md w-full text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="page-title mb-2">Verify Your Email</h1>
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <Mail className="w-4 h-4" />
            <span>Enter the 6-digit OTP sent to your email</span>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="label text-center block">One-Time Password</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input-field text-center text-2xl tracking-[0.5em] font-mono"
              placeholder="------"
            />
          </div>

          <button type="submit" disabled={verifying} className="btn-primary w-full">
            {verifying ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-400/30">
          {canResend ? (
            <button onClick={handleResend} disabled={resending} className="text-primary-600 hover:text-primary-700 font-semibold transition-colors text-sm">
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          ) : (
            <p className="text-sm text-surface-500">Resend OTP in <span className="font-semibold text-primary-600">{countdown}s</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;
