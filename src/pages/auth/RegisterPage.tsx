import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister, useVerifyOtp, useResendOtp } from '../../hooks/useAuth';
import { Truck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const { error: storeError } = useAuthStore();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [displayOtp, setDisplayOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    } else if (resendTimer === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, step]);

  const validateIdentifier = () => {
    if (!identifier) {
      setIdentifierError('Phone number is required');
      return false;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\+?[\d\s\-()]{10,}$/.test(identifier.replace(/\D/g, ''));
    if (!isEmail && !isPhone) {
      setIdentifierError('Please enter a valid email or phone number');
      return false;
    }
    setIdentifierError('');
    return true;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateIdentifier()) return;

    register.mutate(
      { identifier },
      {
        onSuccess: (data) => {
          setDisplayOtp(data.otp || '');
          setStep('otp');
          setResendTimer(30);
          setCanResend(false);
          toast.success('OTP sent!');
        },
        onError: () => toast.error(storeError || 'Registration failed'),
      },
    );
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a 6-digit OTP');
      return;
    }

    verifyOtp.mutate(
      { identifier, otp },
      {
        onSuccess: () => {
          toast.success('Account verified successfully!');
          navigate('/');
        },
        onError: () => toast.error(storeError || 'OTP verification failed'),
      },
    );
  };

  const handleResendOtp = () => {
    resendOtp.mutate(
      { identifier },
      {
        onSuccess: (data) => {
          setDisplayOtp(data.otp || '');
          setOtp('');
          setResendTimer(30);
          setCanResend(false);
          toast.success('OTP resent!');
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-700 mb-2 flex items-center justify-center gap-2"><Truck className="w-7 h-7" /> Join Our Team</h1>
          <p className="text-brand-600">
            {step === 'details' ? 'Enter your phone number to get started' : 'Verify your identity'}
          </p>
        </div>

        {step === 'details' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-semibold text-brand-700 mb-2">
                Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (identifierError) setIdentifierError('');
                }}
                placeholder="9001234567"
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 ${
                  identifierError
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {identifierError && <p className="text-red-600 text-sm mt-1">{identifierError}</p>}
            </div>

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mt-6"
            >
              {register.isPending ? 'Sending OTP...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            {displayOtp && (
              <p className="text-xs text-brand-600 text-center">
                Dev OTP: <span className="font-mono font-bold">{displayOtp}</span>
              </p>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-brand-700 mb-2">
                6-Digit OTP sent to {identifier}
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
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 text-center text-2xl tracking-widest ${
                  otpError
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {otpError && <p className="text-red-600 text-sm mt-1">{otpError}</p>}
            </div>

            <button
              type="submit"
              disabled={verifyOtp.isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {verifyOtp.isPending ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={!canResend || resendOtp.isPending}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                canResend
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canResend ? (resendOtp.isPending ? 'Resending...' : 'Resend OTP') : `Resend OTP in ${resendTimer}s`}
            </button>

            <button
              type="button"
              onClick={() => { setStep('details'); setOtp(''); }}
              className="w-full text-brand-600 py-2 font-semibold hover:text-brand-700 transition"
            >
              Back
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-brand-200"></div>
          <span className="text-brand-600 text-sm">Already registered?</span>
          <div className="flex-1 h-px bg-brand-200"></div>
        </div>

        <Link
          to="/auth/login"
          className="block w-full text-center px-4 py-3 border-2 border-brand-300 text-brand-700 font-bold rounded-lg hover:bg-brand-50 transition"
        >
          Log In Instead
        </Link>

        <p className="text-xs text-brand-600 text-center mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
