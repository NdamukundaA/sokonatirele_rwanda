import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { registerUser } from '@/ApiConfig/ApiConfiguration';
import image1 from '@/data/HomeNavbar/image1.jpg';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ field?: string; message: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { setAuthenticated } = useCartStore();

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors: { field: string; message: string }[] = [];

    if (!fullName.trim()) {
      newErrors.push({ field: 'fullName', message: 'Full name is required' });
    }

    if (!email && !phoneNumber) {
      newErrors.push({ field: 'email', message: 'Email is required' });
      newErrors.push({ field: 'phoneNumber', message: 'Phone number is required' });
    } else {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        newErrors.push({ field: 'email', message: 'Invalid email format' });
      }
      if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.trim())) {
        newErrors.push({ field: 'phoneNumber', message: 'Invalid phone number format' });
      }
    }

    if (!password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 6) {
      newErrors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    if (!agreeToTerms) {
      newErrors.push({ field: 'terms', message: 'You must agree to the Terms & Conditions' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const getErrorMessages = (field: string) => {
    return errors.filter(error => error.field === field).map(error => error.message);
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        password: password.trim(),
      };

      const response = await registerUser(userData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setAuthenticated(true);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.errors && Array.isArray(error.errors)) {
        setErrors(error.errors);
        error.errors.forEach((err: any) => toast.error(err.message));
      } else {
        setErrors([{ message: error.message || 'An unexpected error occurred' }]);
        toast.error(error.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/2 p-8 flex flex-col">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ChevronLeft size={20} className="mr-1" />
            <span>Back to home</span>
          </Link>
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Create an account</h1>
            <p className="text-gray-600">Fill in your details to get started</p>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded" aria-live="assertive">
              <ul className="list-disc list-inside text-red-600">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`bg-gray-50 ${getErrorMessages('fullName').length ? 'border-red-500' : ''}`}
                aria-invalid={!!getErrorMessages('fullName').length}
                aria-describedby={getErrorMessages('fullName').length ? 'fullName-error' : undefined}
              />
              {getErrorMessages('fullName').map((msg, idx) => (
                <p key={idx} id="fullName-error" className="text-red-500 text-sm">{msg}</p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email {!phoneNumber && <span className="text-red-500">*</span>}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-gray-50 ${getErrorMessages('email').length ? 'border-red-500' : ''}`}
                aria-invalid={!!getErrorMessages('email').length}
                aria-describedby={getErrorMessages('email').length ? 'email-error' : undefined}
              />
              {getErrorMessages('email').map((msg, idx) => (
                <p key={idx} id="email-error" className="text-red-500 text-sm">{msg}</p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number {!email && <span className="text-red-500">*</span>}</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={`bg-gray-50 ${getErrorMessages('phoneNumber').length ? 'border-red-500' : ''}`}
                aria-invalid={!!getErrorMessages('phoneNumber').length}
                aria-describedby={getErrorMessages('phoneNumber').length ? 'phoneNumber-error' : undefined}
              />
              {getErrorMessages('phoneNumber').map((msg, idx) => (
                <p key={idx} id="phoneNumber-error" className="text-red-500 text-sm">{msg}</p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-gray-50 pr-10 ${getErrorMessages('password').length ? 'border-red-500' : ''}`}
                  aria-invalid={!!getErrorMessages('password').length}
                  aria-describedby={getErrorMessages('password').length ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {getErrorMessages('password').map((msg, idx) => (
                <p key={idx} id="password-error" className="text-red-500 text-sm">{msg}</p>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-gray-50 pr-10 ${getErrorMessages('confirmPassword').length ? 'border-red-500' : ''}`}
                  aria-invalid={!!getErrorMessages('confirmPassword').length}
                  aria-describedby={getErrorMessages('confirmPassword').length ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {getErrorMessages('confirmPassword').map((msg, idx) => (
                <p key={idx} id="confirmPassword-error" className="text-red-500 text-sm">{msg}</p>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked: boolean) => setAgreeToTerms(checked)}
                aria-invalid={!!getErrorMessages('terms').length}
                aria-describedby={getErrorMessages('terms').length ? 'terms-error' : undefined}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to all the{' '}
                <Link to="#" className="text-green-600">Terms & Conditions</Link>
              </label>
            </div>
            {getErrorMessages('terms').map((msg, idx) => (
              <p key={idx} id="terms-error" className="text-red-500 text-sm">{msg}</p>
            ))}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign up'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden md:block w-1/2 relative">
        <img
          src={image1}
          alt="Signup"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h2 className="text-4xl font-bold mb-4">Welcome to Isokonatirele</h2>
            <p className="text-lg">
              Your one-stop shop for fresh, high-quality groceries delivered straight to your door.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;