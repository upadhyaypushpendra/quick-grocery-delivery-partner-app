import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister, useVerifyOtp, useResendOtp } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const { error: storeError } = useAuthStore();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    identifier: '',
  });

  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    identifier: '',
    otp: '',
  });
  const [displayOtp, setDisplayOtp] = useState(''); // For showing OTP in dev mode
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && step === 'otp') {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, step]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { firstName: '', lastName: '', identifier: '', otp: '' };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.identifier) {
      newErrors.identifier = 'Email or phone number is required';
      isValid = false;
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
      const isPhone = /^\+?[\d\s\-()]{10,}$/.test(formData.identifier.replace(/\D/g, ''));
      if (!isEmail && !isPhone) {
        newErrors.identifier = 'Please enter a valid email or phone number';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    register.mutate(
      formData,
      {
        onSuccess: (data) => {
          setDisplayOtp(data.otp || '');
          setStep('otp');
          setResendTimer(30); // Start 30-second countdown
          setCanResend(false);
          toast.success('Account created! Verify your OTP.');
        },
        onError: () => {
          toast.error(storeError || 'Registration failed');
        },
      }
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setErrors((prev) => ({ ...prev, otp: 'Please enter a 6-digit OTP' }));
      return;
    }

    verifyOtp.mutate(
      { identifier: formData.identifier, otp },
      {
        onSuccess: () => {
          toast.success('Account verified successfully!');
          navigate('/');
        },
        onError: () => {
          toast.error(storeError || 'OTP verification failed');
        },
      }
    );
  };

  const handleResendOtp = async () => {
    resendOtp.mutate(
      { identifier: formData.identifier },
      {
        onSuccess: (data) => {
          setDisplayOtp(data.otp || '');
          setOtp(''); // Clear previous OTP input
          setResendTimer(30); // Reset countdown
          setCanResend(false);
          toast.success('OTP resent!');
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 py-12">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-700 mb-2">
            🚚 Join Our Team
          </h1>
          <p className="text-brand-600">
            {step === 'details' ? 'Create your delivery partner account' : 'Verify OTP'}
          </p>
        </div>

        {/* Step 1: Registration Details */}
        {step === 'details' && (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-brand-700 mb-2">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 ${
                  errors.firstName
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-brand-700 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 ${
                  errors.lastName
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-brand-700 mb-2">
                Phone Number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="9001234567"
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 ${
                  errors.identifier
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {errors.identifier && <p className="text-red-600 text-sm mt-1">{errors.identifier}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition mt-6"
            >
              {register.isPending ? 'Creating Account...' : 'Create Account'}
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
                  if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
                }}
                placeholder="000000"
                maxLength={6}
                className={`w-full px-4 py-2 border-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 text-center text-2xl letter-spacing ${
                  errors.otp
                    ? 'border-red-300 bg-red-50'
                    : 'border-brand-200 bg-brand-50 focus:border-brand-400'
                }`}
              />
              {errors.otp && <p className="text-red-600 text-sm mt-1">{errors.otp}</p>}
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
              disabled={!canResend || resendOtp.isPending}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                canResend
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            >
              {canResend
                ? resendOtp.isPending
                  ? 'Resending...'
                  : 'Resend OTP'
                : `Resend OTP in ${resendTimer}s`}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('details');
                setOtp('');
              }}
              className="w-full text-brand-600 py-2 font-semibold hover:text-brand-700 transition"
            >
              Back to Registration
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-brand-200"></div>
          <span className="text-brand-600 text-sm">Already registered?</span>
          <div className="flex-1 h-px bg-brand-200"></div>
        </div>

        {/* Login Link */}
        <Link
          to="/auth/login"
          className="block w-full text-center px-4 py-3 border-2 border-brand-300 text-brand-700 font-bold rounded-lg hover:bg-brand-50 transition"
        >
          Log In Instead
        </Link>

        {/* Footer */}
        <p className="text-xs text-brand-600 text-center mt-6">
          By registering, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
