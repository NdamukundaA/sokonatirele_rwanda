import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import image2 from "/images/image2.jpg";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const validateForm = () => {
    const errors: string[] = [];

    if (!email) {
      errors.push("Please provide an email");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email format");
    }
    if (!password) {
      errors.push("Password is required");
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
      // Dummy authentication - replace with your backend API
      if (email === "admin@tasty-groceries.com" && password === "admin123") {
        setLoadingProgress(100);
        localStorage.setItem("adminToken", "dummy-admin-token");
        toast({
          title: "Login Successful",
          description: "Welcome to Tasty Groceries Admin Dashboard",
        });
        navigate("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setErrorMessages([errorMessage]);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
            <h1 className="text-3xl font-bold">Welcome Admin</h1>
            <p className="text-slate-500 mt-2">Please log in to access the admin dashboard</p>
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
                  placeholder="admin@tasty-groceries.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={errorMessages.includes("Please provide an email") ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`pr-10 ${errorMessages.includes("Password is required") ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
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
            <h2 className="text-4xl font-bold mb-4">Tasty Groceries Admin</h2>
            <p className="text-lg">
              Manage your store, products, and orders all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;