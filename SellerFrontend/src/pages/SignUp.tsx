import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { registerAdmin } from '@/ApiConfig/ApiConfiguration';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import image2 from "@/data/image2.jpg";
import axios from 'axios';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    companyName: '',
    companyAddress: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
    } else {
      setLoadingProgress(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (errorMessages.length > 0) {
      const timer = setTimeout(() => {
        setErrorMessages([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!formData.fullName) {
      errors.push('Full name is required');
    }
    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format');
    }
    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }
    if (!formData.phoneNumber) {
      errors.push('Phone number is required');
    }
    if (!formData.companyName) {
      errors.push('Company name is required');
    }
    if (!formData.companyAddress) {
      errors.push('Company address is required');
    }

    setErrorMessages(errors);
    return errors.length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerAdmin({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        companyName: formData.companyName,
        companyAddress: formData.companyAddress
      });

      if (response.status === 201) {
        setLoadingProgress(100);
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error: any) {
      const errorMessage = error.message || error.response?.data?.message || 'Registration failed. Please try again.';
      
      // Focus the email input if it's an "email exists" error
      if (errorMessage.toLowerCase().includes('email already exists')) {
        const emailInput = document.getElementById('email');
        if (emailInput) {
          emailInput.focus();
        }
        // Add a shake animation class to the email input
        const emailContainer = emailInput?.parentElement;
        if (emailContainer) {
          emailContainer.classList.add('animate-shake');
          setTimeout(() => emailContainer.classList.remove('animate-shake'), 500);
        }
      }

      setErrorMessages([errorMessage]);
      console.error('Registration error:', error);
      
      // Show toast notification for email exists error
      if (errorMessage.toLowerCase().includes('email already exists')) {
        toast.error('This email is already registered', {
          description: 'Please try logging in or use a different email address.',
          action: {
            label: 'Login',
            onClick: () => navigate('/login')
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 sm:px-16 lg:px-24">
        {isLoading && (
          <div className="fixed top-0 left-0 w-full">
            <Progress value={loadingProgress} className="h-1" />
          </div>
        )}
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">Create Seller Account</h1>
            <p className="text-slate-500 mt-2">Join our marketplace as a seller</p>
          </div>

          {errorMessages.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg" aria-live="assertive">
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  {errorMessages.map((error, index) => (
                    <div key={index} className="text-red-700">
                      {error.includes("email already exists") ? (
                        <div className="space-y-2">
                          <p className="font-semibold">Email Already Registered</p>
                          <p className="text-sm text-red-600">This email address is already in use. Please:</p>
                          <ul className="text-sm list-disc list-inside text-red-600 ml-2">
                            <li>Try logging in if you already have an account</li>
                            <li>Use a different email address</li>
                            <li>Contact support if you need help</li>
                          </ul>
                        </div>
                      ) : (
                        <p>{error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100" onSubmit={handleSignUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="focus:ring-emerald-500 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`${errorMessages.some(msg => msg.toLowerCase().includes('email')) ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500 border-gray-200'}`}
                  />
                  {errorMessages.some(msg => msg.toLowerCase().includes('email')) && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pr-10"
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="+250 788 123 456"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Your company name"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  name="companyAddress"
                  type="text"
                  placeholder="Your company address"
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating your account...
                  </div>
                ) : (
                  'Create Seller Account'
                )}
              </Button>

              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-sm text-gray-500">or</span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-gray-600">Already have a seller account? </span>
                  <Button
                    variant="link"
                    className="font-semibold text-emerald-600 hover:text-emerald-700"
                    onClick={() => navigate('/login')}
                  >
                    Log in here
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 relative bg-emerald-700">
        <img
          src={image2}
          alt="Sign Up"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center max-w-lg p-12">
            <h2 className="text-4xl font-bold mb-6 leading-tight">Welcome to Isokonatirele</h2>
            <div className="h-1 w-20 bg-emerald-400 mx-auto mb-8"></div>
            <p className="text-xl leading-relaxed mb-8">
              Join our marketplace and start selling your fresh, high-quality groceries to customers across Rwanda.
            </p>
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">Access to thousands of customers</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">Easy-to-use seller dashboard</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">Secure payments and support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
