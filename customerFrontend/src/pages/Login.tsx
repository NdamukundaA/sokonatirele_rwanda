import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/ApiConfig/ApiConfiguration";
import image2 from "@/data/HomeNavbar/image2.jpg";
import ForgotPassword from "./forgotPasswordPage";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState("email");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const navigate = useNavigate();
  const { setAuthenticated } = useCartStore();

  useEffect(() => {
    if (errorMessages.length > 0) {
      const timer = setTimeout(() => {
        setErrorMessages([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthenticated(true);
    }
  }, [setAuthenticated]);

  const validateForm = () => {
    const errors = [];

    if (!identifier) {
      errors.push("Please provide an email or phone number");
    } else if (identifierType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      errors.push("Invalid email format");
    } else if (identifierType === "phone" && !/^\+?[1-9]\d{1,14}$/.test(identifier)) {
      errors.push("Invalid phone number format (e.g., +1234567890)");
    }
    if (!password) {
      errors.push("Password is required");
    }

    setErrorMessages(errors);
    return errors.length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessages([]);
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        identifier: identifier.trim(),
        password: password.trim()
      };

      const response = await loginUser(loginData);

      if (response.token) {
        localStorage.setItem("token", response.token);
        if (rememberMe && response.user) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: response.user.email,
              phoneNumber: response.user.phoneNumber,
              fullName: response.user.fullName,
            })
          );
        }

        setAuthenticated(true);
        toast.success("Login successful!");
        navigate("/");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Error logging in user:", error);
      
      let errorMsg = [];
      
      if (error.errors && Array.isArray(error.errors)) {
        errorMsg = error.errors.map((err: any) => err.message);
      } else if (error.message) {
        errorMsg = [error.message];
      } else {
        errorMsg = ["Invalid credentials"];
      }

      setErrorMessages(errorMsg);
      toast.error(errorMsg[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setForgotPasswordOpen(true);
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
            <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Please enter log in details below</p>
          </div>

          {errorMessages.length > 0 && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded" aria-live="assertive">
              <ul className="list-disc list-inside text-red-600">
                {errorMessages.map((error, index) => (
                  <li key={index}>{error || "An unknown error occurred."}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">
                {identifierType === "email" ? "Email" : "Phone Number"}
              </Label>
              <RadioGroup
                defaultValue="email"
                onValueChange={(value) => {
                  setIdentifierType(value);
                  setIdentifier("");
                }}
                className="flex space-x-4 mb-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-option" />
                  <Label htmlFor="email-option">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-option" />
                  <Label htmlFor="phone-option">Phone Number</Label>
                </div>
              </RadioGroup>
              <Input
                id="identifier"
                type={identifierType === "email" ? "email" : "tel"}
                placeholder={identifierType === "email" ? "name@example.com" : "+1234567890"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-green-600 hover:text-green-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>

            <Button
              type="button"
              onClick={handleLogin}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-green-600 hover:text-green-500 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
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

      <ForgotPassword 
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;

