import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updatePassword } from "@/ApiConfig/ApiConfiguration";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [identifierType, setIdentifierType] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1); 
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const validateIdentifier = () => {
    const errors = [];
    
    if (!identifier) {
      errors.push("Please provide an email or phone number");
    } else if (identifierType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      errors.push("Invalid email format");
    } else if (identifierType === "phone" && !/^\+?[1-9]\d{1,14}$/.test(identifier)) {
      errors.push("Invalid phone number format (e.g., +1234567890)");
    }
    
    setErrors(errors);
    return errors.length === 0;
  };

  const validatePassword = () => {
    const errors = [];
    
    if (!newPassword) {
      errors.push("Password is required");
    } else if (newPassword.length < 6) {
      errors.push("Password must be at least 6 characters");
    }
    
    if (newPassword !== confirmPassword) {
      errors.push("Passwords don't match");
    }
    
    setErrors(errors);
    return errors.length === 0;
  };

  const handleVerifyIdentifier = () => {
    if (!validateIdentifier()) return;
    
    // Move to step 2 (Enter new password)
    setStep(2);
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    
    setLoading(true);
    try {
      const passwordData = {
        [identifierType]: identifier,
        password: newPassword,
      };
      
      await updatePassword(passwordData);
      toast.success("Password updated successfully!");
      resetForm();
      onClose();
    } catch (error) {
      const errorMessage =
        error.errors?.map((err) => err.msg) || 
        [error.message] || 
        ["Failed to reset password. Please try again."];
      setErrors(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIdentifier("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors([]);
    setStep(1);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Enter your email or phone number to reset your password." 
              : "Create a new password for your account."}
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="p-3 bg-red-100 border border-red-400 rounded mb-4">
            <ul className="list-disc list-inside text-red-600 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier-type">Verification Method</Label>
              <RadioGroup
                defaultValue="email"
                value={identifierType}
                onValueChange={setIdentifierType}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="reset-email-option" />
                  <Label htmlFor="reset-email-option">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phoneNumber" id="reset-phone-option" />
                  <Label htmlFor="reset-phone-option">Phone Number</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-identifier">
                {identifierType === "email" ? "Email Address" : "Phone Number"}
              </Label>
              <Input
                id="reset-identifier"
                type={identifierType === "email" ? "email" : "tel"}
                placeholder={identifierType === "email" ? "name@example.com" : "+1234567890"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                className="mt-2"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleVerifyIdentifier}
                className="bg-green-600 hover:bg-green-700 mt-2"
                disabled={loading}
              >
                Next
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setStep(1)}
                className="mt-2"
              >
                Back
              </Button>
              <Button 
                type="button" 
                onClick={handleResetPassword}
                className="bg-green-600 hover:bg-green-700 mt-2"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPassword;