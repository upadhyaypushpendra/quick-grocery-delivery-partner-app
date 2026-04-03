import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin, useVerifyOtp, useResendOtp } from '../../hooks/useAuth';
import { Truck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const { error: storeError } = useAuthStore();

  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [displayOtp, setDisplayOtp] = useState(''); // For showing OTP in dev mode
  const [resendTimer, setResendTimer] = useState(0);

  // Timer for resend OTP
  useEffect(() => {
    let timeout: number;
    if (resendTimer > 0) {
      timeout = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [resendTimer, step]);

  const validateIdentifier = () => {
    if (!identifier) {
      setIdentifierError('Email or phone number is required');
      return false;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\+?[\d\s\-()]{10,}$/.test(identifier.replace(/\D/g, ''));
    if (!isEmail && !isPhone) {
      setIdentifierError('Please enter a valid email or phone number');
      return false;
    }
    return true;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateIdentifier()) return;

    login.mutate(
      { identifier },
      {
        onSuccess: (data) => {
          setDisplayOtp(data.otp || ''); // Show OTP in dev mode
          setStep('otp');
          setResendTimer(30); // Start 30-second countdown
          toast.success('OTP sent!');
        },
        onError: () => {
          toast.error(storeError || 'Failed to send OTP');
        },
      }
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    verifyOtp.mutate(
      { identifier, otp },
      {
        onSuccess: () => {
          toast.success('Logged in successfully!');
          navigate('/');
        },
        onError: () => {
          toast.error(storeError || 'Invalid OTP');
        },
      }
    );
  };

  const handleResendOtp = async () => {
    resendOtp.mutate(
      { identifier },
      {
        onSuccess: (data) => {
          setDisplayOtp(data.otp || '');
          setOtp(''); // Clear previous OTP input
          setResendTimer(30); // Reset countdown
          toast.success('OTP resent!');
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 to-brand-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-700 mb-2 flex items-center justify-center gap-2">
            <Truck className="w-7 h-7" /> Delivery Partner
          </h1>
          <p className="text-brand-600">
            {step === 'identifier' ? 'Enter your details' : 'Verify OTP'}
          </p>
        </div>

        {/* Step 1: Request OTP */}
        {step === 'identifier' && (
          <form onSubmit={handleRequestOtp} className="space-y-5">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-brand-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (identifierError) setIdentifierError('');
                }}
                placeholder="9876543210"
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 ${
                  identifierError
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {identifierError && (
                <p className="text-red-600 text-sm mt-1">{identifierError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={login.isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {login.isPending ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-brand-700 mb-2">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.slice(0, 6));
                  if (otpError) setOtpError('');
                }}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 text-center text-2xl letter-spacing ${
                  otpError
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {otpError && (
                <p className="text-red-600 text-sm mt-1">{otpError}</p>
              )}
              {displayOtp && (
                <p className="text-xs text-brand-600 mt-2 text-center">
                  Dev OTP: <span className="font-mono font-bold">{displayOtp}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyOtp.isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {verifyOtp.isPending ? 'Verifying...' : 'Verify OTP'}
            </button>

            {/* Resend OTP Button */}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || resendOtp.isPending}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                resendTimer <= 0
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              {resendTimer <= 0
                ? resendOtp.isPending
                  ? 'Resending...'
                  : 'Resend OTP'
                : `Resend OTP in ${resendTimer}s`}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('identifier');
                setOtp('');
                setOtpError('');
              }}
              className="w-full text-brand-600 py-2 font-semibold hover:text-brand-700 transition"
            >
              Change Identifier
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-brand-200"></div>
          <span className="text-brand-600 text-sm">Don't have an account?</span>
          <div className="flex-1 h-px bg-brand-200"></div>
        </div>

        {/* Sign Up Link */}
        <Link
          to="/auth/register"
          className="block w-full text-center px-4 py-3 border-2 border-brand-300 text-brand-700 font-bold rounded-lg hover:bg-brand-50 transition"
        >
          Sign Up as Delivery Partner
        </Link>

        {/* Footer */}
        <p className="text-xs text-brand-600 text-center mt-6">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
