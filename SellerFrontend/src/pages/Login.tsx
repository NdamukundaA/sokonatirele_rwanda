import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import image2 from "@/data/image2.jpg";

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

  const validateForm = () => {
    const errors: string[] = [];

    if (!email) {
      errors.push('Please provide an email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }
    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 4) {
      errors.push('Password must be at least 4 characters long');
    }

    setErrorMessages(errors);
    return errors.length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);

      if (rememberMe) {
        localStorage.setItem(
          'seller',
          JSON.stringify({
            email,
            fullName: 'seller',
          })
        );
      }

      setLoadingProgress(100);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setErrorMessages([errorMessage]);
      console.error('Login error:', error);
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
            <h1 className="text-3xl font-bold">Welcome Seller</h1>
            <p className="text-slate-500 mt-2">Please log in to your seller account</p>
          </div>

          {errorMessages.length > 0 && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded" aria-live="assertive">
              <ul className="list-disc list-inside text-red-600">
                {errorMessages.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean) => setRememberMe(!!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </Button>

            <div className="mt-4 text-center space-y-2">
              <p className="text-slate-600">Don't have a seller account?</p>
              <Button
                type="button"
                variant="outline"
                className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => navigate('/signup')}
              >
                Register as a Seller
              </Button>
              <p className="text-sm text-slate-500">
                Join our marketplace and start selling your products to thousands of customers.
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 relative">
        <img
          src={image2}
          alt="Login"
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

export default Login;