import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package, CreditCard, MapPin, Truck, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { getAllAddresses, placeOrder } from "@/ApiConfig/ApiConfiguration";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import AddressFormDialog from "@/components/AddressFormDialog";

interface Address {
  _id: string;
  description: string;
  city: string;
  street: string;
  district: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, fetchCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const status = urlParams.get('status');
    const orderId = urlParams.get('orderId') || localStorage.getItem('lastOrderId');

    if (status === 'success' && orderId) {
      navigate('/order-confirmation', { replace: true });
      return;
    }

    fetchCart();
    fetchAddresses();
  }, [fetchCart, location.search, navigate]);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const response = await getAllAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
        const defaultAddress = response.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (error) {
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setIsContinuing(true);
    setTimeout(() => {
      setCurrentStep(2);
      setIsContinuing(false);
    }, 500);
  };

  const handlePlaceOrder = async () => {
  if (!selectedAddress) {
    toast.error('Please select a shipping address');
    return;
  }

  try {
    setIsPlacingOrder(true);

    // Ensure loader shows for at least 3 seconds
    const minLoaderTime = new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Checkout: Placing order with:', { addressId: selectedAddress, paymentType: paymentMethod });

    const orderPromise = placeOrder({
      addressId: selectedAddress,
      paymentType: paymentMethod,
    });

    // Wait for both the order and minimum loader time
    const [response] = await Promise.all([orderPromise, minLoaderTime]);

    console.log('Checkout: Order response:', response);

    if (response.success) {
      const orderId = response.data?.order?._id || response.order?._id || response.data?._id;
      if (orderId) {
        localStorage.setItem('lastOrderId', orderId);
      }
      if (paymentMethod === 'online' && response.data.paymentUrl) {
        // Redirect to IremboPay payment page
        window.location.href = response.data.paymentUrl;
      } else {
        navigate('/order-confirmation', { replace: true });
      }
    } else {
      toast.error(response.message || 'Failed to place order');
    }
  } catch (error: any) {
    console.error('Checkout: Error placing order:', error);
    const errorMessage = error.details?.message || error.message || 'Failed to place order. Please try again.';
    toast.error(errorMessage);
  } finally {
    setIsPlacingOrder(false);
  }
};

  const selectedAddressData = selectedAddress ? addresses.find(addr => addr._id === selectedAddress) : null;

  const steps = [
    { number: 1, title: "Shipping", icon: Package },
    { number: 2, title: "Payment", icon: CreditCard },
    { number: 3, title: "Confirmation", icon: CheckCircle },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center mb-6">
        <Link to="/cart" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} className="mr-1" />
          <span>Back to cart</span>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? "bg-green-600 border-green-600 text-white"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              <step.icon size={20} />
            </div>
            <span
              className={`ml-2 font-medium ${
                currentStep >= step.number ? "text-green-600" : "text-gray-500"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className="w-16 h-px bg-gray-300 mx-4"></div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Choose a delivery address</h3>
                  <div className="flex gap-4 mb-4">
                    <Button variant="default" size="sm">Saved Address</Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressDialog(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      New Address
                    </Button>
                  </div>

                  <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved address" />
                    </SelectTrigger>
                    <SelectContent>
                      {addresses.map((address) => (
                        <SelectItem key={address._id} value={address._id}>
                          {address.description} - {address.street}, {address.city}
                          {address.isDefault && " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedAddressData && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Selected Address:</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Description:</strong> {selectedAddressData.description}</p>
                        <p><strong>Street:</strong> {selectedAddressData.street}</p>
                        <p><strong>District:</strong> {selectedAddressData.district}</p>
                        <p><strong>City:</strong> {selectedAddressData.city}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
                  onClick={handleContinueToPayment}
                  disabled={!selectedAddress || isContinuing}
                >
                  {isContinuing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Continuing...
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 border rounded-lg bg-blue-50">
                  <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "cash" | "online")}>
                    <div className="flex items-center space-x-2 mb-4">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">
                        <div>
                          <p className="font-medium">Cash on Delivery (MOMO Pay)</p>
                          <p className="text-sm text-gray-600">Pay when your order arrives</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">
                        <div>
                          <p className="font-medium">Online Payment (FlutterWave)</p>
                          <p className="text-sm text-gray-600">Pay securely online with FlutterWave</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'cash' && (
                    <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">Payment Instructions:</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>MOMO PAY CODE:</strong> <span className="text-lg font-bold text-green-600">1706240</span></p>
                        <p className="text-gray-600">
                          Please make your payment using the MOMO PAY CODE <strong>1706240</strong>.
                          Your payment will be checked by admin and approved. We will call you before
                          delivery within 10 minutes to confirm your order.
                        </p>
                      </div>
                    </div>
                  )}
                  {paymentMethod === 'online' && (
                    <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                      <h4 className="font-semibold text-green-700 mb-2">FlutterWave Instructions:</h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          You will be redirected to Flutterwave to complete your payment securely.
                          After payment, you will return to our site to confirm your order.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    disabled={isPlacingOrder}
                  >
                    Back to Shipping
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {paymentMethod === 'online' ? 'Redirecting to Flutterwave...' : 'Placing Order...'}
                      </>
                    ) : (
                      paymentMethod === 'online' ? 'Proceed to Flutterwave' : 'Place Order'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">frw{(item.price * item.quantity).toFixed(2)}</p>
                      {item.discount > 0 && (
                        <p className="text-sm text-gray-500 line-through">frw{item.offerPrice}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>frw{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>Negotiable</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>frw{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddressFormDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        onSuccess={() => {
          setShowAddressDialog(false);
          fetchAddresses();
        }}
      />
    </div>
  );
};

export default Checkout;