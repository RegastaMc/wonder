'use client';

import ShippingForm from '@/components/ShippingForm';
import useCartStore from '@/stores/cartStore';
import { CartItemsType, ShippingFormInputs } from '@/types';
import { ArrowRight, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { createOrder } from '@/app/actions/order';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import MpesaPaymentModal from '@/components/components/Ui/MpesaPaymentModal';
import PaymentForm from '@/components/components/Ui/PaymentForm';

const steps = [
  { id: 1, title: 'Shopping Cart' },
  { id: 2, title: 'Shipping Address' },
  { id: 3, title: 'Payment Method' },
];

// ============================================================
// LOADING COMPONENT
// ============================================================
const CartLoading = () => (
  <div className="flex flex-col gap-8 items-center justify-center mt-12">
    <div className="w-12 h-12 border-4 border-[#DBA39A] border-t-transparent rounded-full animate-spin"></div>
    <p className="text-[#3d2c28]/60">Loading cart...</p>
  </div>
);

// ============================================================
// CART CONTENT COMPONENT (uses useSearchParams)
// ============================================================
const CartContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [shippingForm, setShippingForm] = useState<ShippingFormInputs>();
  const [paymentMethod, setPaymentMethod] = useState<
    'MPESA' | 'CASH_ON_DELIVERY'
  >();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState<string>();

  const activeStep = parseInt(searchParams.get('step') || '1');
  const { cart, removeFromCart, clearCart } = useCartStore();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = 0;
  const shippingFee = subtotal < 5000 ? 0 : 0;
  const total = subtotal + tax + shippingFee;

  const handlePlaceOrder = async () => {
    if (!session?.user?.id) {
      toast.error('Please login to continue');
      router.push('/signin');
      return;
    }

    if (!shippingForm) {
      toast.error('Please fill in shipping information');
      router.push('/cart?step=2');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    const orderItems = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const result = await createOrder({
      userId: session.user.id,
      items: orderItems,
      subtotal,
      tax,
      shippingFee,
      total,
      phone: shippingForm.phone,
      email: shippingForm.email,
      shippingAddress: shippingForm,
      paymentMethod,
    });

    if (result.success) {
      if (paymentMethod === 'MPESA' && result.mpesaResponse) {
        setMpesaCheckoutId(result.mpesaResponse.CheckoutRequestID);
        setShowMpesaModal(true);
      } else if (paymentMethod === 'CASH_ON_DELIVERY') {
        toast.success('Order placed successfully!');
        clearCart();
        router.push(`/`);
      }
    } else {
      toast.error(result.error || 'Failed to place order');
    }

    setIsProcessing(false);
  };

  const handleMpesaSuccess = () => {
    setShowMpesaModal(false);
    toast.success('Payment successful! Order confirmed.');
    clearCart();
    router.push('/my-orders');
  };

  return (
    <div className="flex flex-col gap-8 items-center justify-center mt-12">
      <h1 className="text-2xl font-medium">Your Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
        {steps.map((step) => (
          <div
            className={`flex items-center gap-2 border-b-2 pb-4 ${
              step.id === activeStep ? 'border-gray-800' : 'border-gray-200'
            }`}
            key={step.id}
          >
            <div
              className={`w-6 h-6 rounded-full text-white p-4 flex items-center justify-center ${
                step.id === activeStep ? 'bg-gray-800' : 'bg-gray-400'
              }`}
            >
              {step.id}
            </div>
            <p
              className={`text-sm font-medium ${
                step.id === activeStep ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              {step.title}
            </p>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-16">
        {/* Left Column - Steps Content */}
        <div className="w-full lg:w-7/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8">
          {activeStep === 1 ? (
            cart.length > 0 ? (
              cart.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.id}
                >
                  <div className="flex gap-8">
                    <div className="relative w-32 h-32 bg-gray-50 rounded-lg overflow-hidden">
                      <Image
                        src={(item.images as string) || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">Ksh {item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item)}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-all duration-300 text-red-400 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Your cart is empty</p>
                <button
                  onClick={() => router.push('/products')}
                  className="mt-4 bg-[#DBA39A] hover:bg-[#c49087] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )
          ) : activeStep === 2 ? (
            <ShippingForm setShippingForm={setShippingForm} />
          ) : activeStep === 3 ? (
            <PaymentForm
              onPaymentMethodSelect={setPaymentMethod}
              selectedMethod={paymentMethod}
            />
          ) : null}
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-5/12 shadow-lg border border-gray-100 p-8 rounded-lg flex flex-col gap-8 h-max">
          <h2 className="font-semibold text-lg">Order Summary</h2>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Subtotal</p>
              <p className="font-medium">Ksh {subtotal.toFixed(2)}</p>
            </div>
            {/* <div className="flex justify-between text-sm">
              <p className="text-gray-500">Tax (VAT)</p>
              <p className="font-medium">Ksh {tax.toFixed(2)}</p>
            </div> */}
            <div className="flex justify-between text-sm">
              <p className="text-gray-500">Shipping Fee</p>
              <p className="font-medium">
                {shippingFee === 0 ? 'To be Negotiated' : `To be Negotiated`}
              </p>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <p className="text-gray-800 font-semibold">Total</p>
              <p className="font-bold text-lg text-[#DBA39A]">
                Ksh {total.toFixed(2)}
              </p>
            </div>
          </div>

          {activeStep === 1 && cart.length > 0 && (
            <button
              onClick={() => router.push('/cart?step=2', { scroll: false })}
              className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Continue to Shipping
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {activeStep === 2 && shippingForm && (
            <button
              onClick={() => router.push('/cart?step=3', { scroll: false })}
              className="w-full bg-gray-800 hover:bg-gray-900 transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              Continue to Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {activeStep === 3 && paymentMethod && (
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-[#DBA39A] hover:bg-[#c49087] transition-all duration-300 text-white p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
              {!isProcessing && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* M-Pesa Payment Modal */}
      {showMpesaModal && shippingForm && (
        <MpesaPaymentModal
          isOpen={showMpesaModal}
          onClose={() => setShowMpesaModal(false)}
          onSuccess={handleMpesaSuccess}
          phoneNumber={shippingForm.phone}
          amount={total}
          checkoutRequestId={mpesaCheckoutId}
        />
      )}
    </div>
  );
};

const CartPage = () => {
  return (
    <Suspense fallback={<CartLoading />}>
      <CartContent />
    </Suspense>
  );
};

export default CartPage;