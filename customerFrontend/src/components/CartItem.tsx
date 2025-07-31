import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CartItemProps {
  item: Product & {
    quantity: number;
    description?: string;
    productUnit?: string;
    offerPrice?: number;
    category?: string;
  };
}

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem, isLoading, isAuthenticated } = useCartStore();
  const navigate = useNavigate();

  const handleIncrement = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to update your cart.");
      navigate("/login");
      return;
    }
    try {
      await updateQuantity(String(item.id), item.quantity + 1);
      toast.success("Quantity updated");
    } catch (error) {
      toast.error("Failed to update quantity");
      console.error("Increment error:", error);
    }
  };

  const handleDecrement = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to update your cart.");
      navigate("/login");
      return;
    }
    if (item.quantity > 1) {
      try {
        await updateQuantity(String(item.id), item.quantity - 1);
        toast.success("Quantity updated");
      } catch (error) {
        toast.error("Failed to update quantity");
        console.error("Decrement error:", error);
      }
    }
  };

  const handleRemove = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to update your cart.");
      navigate("/login");
      return;
    }
    try {
      await removeItem(String(item.id));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error("Remove error:", error);
    }
  };

  const quantity = item.quantity || 1;
  const mainPrice = item.price || 0;
  const totalMainPrice = (mainPrice * quantity).toFixed(2);
  const offerTotalPrice = item.offerPrice != null ? (item.offerPrice * quantity).toFixed(2) : null;

  return (
    <div className="flex py-4 border-b border-gray-200">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
        <img
          src={item.image || "/default-image.jpg"}
          alt={item.name || "Product Image"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <div>
            <h3 className="text-lg font-semibold">{item.name || "Unknown Product"}</h3>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-600">RWF {totalMainPrice}</p>
            {offerTotalPrice && (
              <p className="text-sm text-gray-500 line-through">
                RWF {offerTotalPrice}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{item.productUnit || item.unit || "unit"}</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={handleDecrement}
                disabled={isLoading || quantity <= 1}
              >
                <Minus size={16} />
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={handleIncrement}
                disabled={isLoading}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-red-500"
            onClick={handleRemove}
            disabled={isLoading}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;