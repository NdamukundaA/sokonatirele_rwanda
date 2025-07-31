import { useState, useEffect } from "react";
import { ShoppingCart, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const CartDrawer = () => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, isAuthenticated, isLoading, isRefreshing } = useCartStore();
  const [open, setOpen] = useState(false);
  const [isViewCartLoading, setIsViewCartLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setIsViewCartLoading(false);
      setIsCheckoutLoading(false);
    }
  }, [open]);

  const handleNavigate = (path, loadingStateSetter) => {
    loadingStateSetter(true);
    setTimeout(() => {
      setOpen(false);
      navigate(path);
      loadingStateSetter(false);
    }, 1000);
  };

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to update your cart.");
      navigate("/login");
      return;
    }
    
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to remove items from your cart.");
      navigate("/login");
      return;
    }
    
    await removeItem(itemId);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl flex flex-col" style={{ maxHeight: "85vh" }}>
          <DrawerHeader className="flex items-center justify-between">
            <DrawerTitle className="text-xl">Your Cart ({totalItems})</DrawerTitle>
            <DrawerDescription className="sr-only">
              Shopping cart containing {totalItems} items with a total value of RWF {totalPrice.toFixed(2)}
            </DrawerDescription>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading cart...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700">Your cart is empty</h3>
              <p className="text-gray-500 mt-2 mb-8 max-w-md">
                Looks like you haven't added any products to your cart yet.
              </p>
              <DrawerClose asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  Continue Shopping
                </Button>
              </DrawerClose>
            </div>
          ) : (
            <>
              {isRefreshing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <div className="flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                    <span className="text-gray-600">Updating cart...</span>
                  </div>
                </div>
              )}

              <div className={`px-4 overflow-y-auto flex-grow ${isRefreshing ? 'opacity-50' : ''}`}>
                {items.map((item) => (
                  <div key={item.id} className="flex py-4 border-b">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image || '/default-image.jpg'}
                        alt={item.name || 'Product Image'}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <div>
                            <h3 className="text-sm font-medium">{item.name || 'Unknown Product'}</h3>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-600">
                              RWF {(item.price * item.quantity).toFixed(2)}
                            </p>
                            {item.offerPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                RWF {(item.offerPrice * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{item.unit || 'unit'}</span>
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-none"
                              onClick={() => handleQuantityUpdate(String(item.id), item.quantity - 1)}
                              disabled={item.quantity <= 1 || isRefreshing}
                            >
                              -
                            </Button>
                            <span className="w-6 text-center text-xs">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-none"
                              onClick={() => handleQuantityUpdate(String(item.id), item.quantity + 1)}
                              disabled={isRefreshing}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 text-xs p-0"
                          onClick={() => handleRemoveItem(String(item.id))}
                          disabled={isRefreshing}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`p-4 bg-white ${isRefreshing ? 'opacity-50' : ''}`}>
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-medium">
                  <p>Subtotal</p>
                  <p className="text-green-600">RWF {totalPrice.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping price will be negotiable with delivery agent.</p>
              </div>

              <div className={`px-4 pb-6 mt-4 bg-white ${isRefreshing ? 'opacity-50' : ''}`}>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 mb-3"
                  onClick={() => handleNavigate('/cart', setIsViewCartLoading)}
                  disabled={isViewCartLoading || isRefreshing}
                >
                  {isViewCartLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "View Cart"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mb-3"
                  onClick={() => handleNavigate('/checkout', setIsCheckoutLoading)}
                  disabled={isCheckoutLoading || isRefreshing}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Checkout"
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setOpen(false)}
                  disabled={isViewCartLoading || isCheckoutLoading || isRefreshing}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;