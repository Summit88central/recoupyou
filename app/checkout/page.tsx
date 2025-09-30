"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Mail, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Dynamically import PaystackButton to avoid SSR issues
const PaystackButton = dynamic(
  () => import('react-paystack').then((mod) => mod.PaystackButton),
  { ssr: false }
);

const CheckoutPage: React.FC = () => {
  const { state, clearCart } = useCart();
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Silent validation for UI state (no error messages)
  const isFormValid = () => {
    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      return false;
    }
    
    return true;
  };

  // Validation with error messages for form submission
  const validateForm = () => {
    if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handlePaymentSuccess = async (reference: any) => {
    setIsProcessing(true);
    
    try {
      // Process each item in the cart
      const purchasePromises = state.items.map(async (item) => {
        const purchaseData = {
          email: customerInfo.email,
          payment_reference: reference.reference,
          amount: item.item.price * item.quantity,
          item_type: item.type,
          ...(item.type === 'guide' ? { guide_id: item.id } : { bundle_id: item.id })
        };

        const response = await fetch('/api/purchases', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchaseData),
        });

        if (!response.ok) {
          throw new Error(`Failed to record purchase for ${item.type}: ${item.id}`);
        }

        return response.json();
      });

      await Promise.all(purchasePromises);

      // Send email with guides
      await fetch('/api/send-guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          items: state.items,
          paymentReference: reference.reference,
        }),
      });

      clearCart();
      toast.success('Payment successful! Check your email for the guides.');
      router.push('/checkout/success');
    } catch (error) {
      console.error('Error processing purchase:', error);
      toast.error('Payment successful but there was an issue processing your order. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    toast.info('Payment cancelled');
  };

  const paystackConfig = {
    reference: `guide_${Date.now()}`,
    email: customerInfo.email,
    amount: Math.round(state.total * 100), // Paystack expects amount in kobo
    currency: 'ZAR', // South African Rand
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    text: 'Pay Now',
    onSuccess: handlePaymentSuccess,
    onClose: handlePaymentClose,
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some guides to your cart before checking out.</p>
            <Link href="/guides">
              <Button className="bg-pink-600 hover:bg-pink-700">
                Browse Guides
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/guides" className="inline-flex items-center text-pink-600 hover:text-pink-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guides
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={customerInfo.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={customerInfo.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your guides will be sent to this email address
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {'title' in item.item ? item.item.title : item.item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item.type === 'bundle' ? 'Bundle' : 'Guide'} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatPrice(item.item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-pink-600">{formatPrice(state.total)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  {isClient && isFormValid() ? (
                    <PaystackButton
                      {...paystackConfig}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                      text={isProcessing ? "Processing..." : "Pay Now"}
                    />
                  ) : (
                    <Button
                      onClick={() => validateForm()}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isClient && isFormValid() ? 'Pay Now' : 'Complete Information to Pay'}
                    </Button>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Guides will be delivered instantly via email
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;