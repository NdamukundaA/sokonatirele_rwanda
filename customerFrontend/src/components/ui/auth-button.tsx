

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { User, UserPlus, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { logoutUser } from "@/ApiConfig/ApiConfiguration";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AuthButtonProps {
  // Add any props here if needed
}

const AuthButton = (props: AuthButtonProps) => {
  const { isAuthenticated, setAuthenticated } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAuthenticated(false);
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      setAuthenticated(false);
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      navigate('/');
    }
  };

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <User className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center cursor-pointer">
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/track-orders" className="flex items-center cursor-pointer">
              <span>Track Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex items-center cursor-pointer"
          >
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/login" className="flex items-center">
          <LogIn className="mr-2 h-4 w-4" /> Login
        </Link>
      </Button>
      <Button className="bg-green-600 hover:bg-green-700" size="sm" asChild>
        <Link to="/signup" className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
        </Link>
      </Button>
    </div>
  );
};

export default AuthButton;

