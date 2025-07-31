import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { Link } from "react-router-dom";
import CartItem from "@/components/CartItem";
import { toast } from "sonner";

const Cart = () => {
  const { items, totalPrice, clearCart, isLoading, fetchCart } = useCartStore();
  const navigate = useNavigate();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = () => {
    setIsCheckoutLoading(true);
    setTimeout(() => {
      navigate('/checkout');
      setIsCheckoutLoading(false);
    }, 3000);
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to shopping</span>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <ShoppingCart className="mr-3" size={28} />
        Your Cart
      </h1>
      
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart size={64} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">Your cart is empty</h3>
          <p className="text-gray-500 mt-2 mb-8 max-w-md">
            Looks like you haven't added any products to your cart yet.
          </p>
          <div className="flex gap-4">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/track-orders')}
            >
              Track Orders
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id}>
                      <CartItem item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="flow-root">
                <div className="space-y-4">
                  <div className="flex justify-between text-base">
                    <p>Subtotal</p>
                    <p>RWF {totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between text-base">
                    <p>Delivery</p>
                    <p>Negotiable with delivery agent</p>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <p>Total</p>
                    <p>RWF {totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 mb-3"
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/products')}
                  disabled={isCheckoutLoading}
                >
                  Continue Shopping
                </Button>
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={handleClearCart}
                  disabled={isCheckoutLoading}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;