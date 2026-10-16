"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Mail, User, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  const getDiscountedItemTotal = (item: any, quantity: number, code: string) => {
    const base = item.price * quantity;
    if (!code) return base;
    const itemPromo = (item as any).promo_code || '';
    const discount = (item as any).discount ?? 0;
    if (discount > 0 && itemPromo && itemPromo.trim().toLowerCase() === code.trim().toLowerCase()) {
      const discountedUnit = item.price * (1 - discount / 100);
      return Math.max(0, discountedUnit * quantity);
    }
    return base;
  };

  const discountedTotal = state.items.reduce((sum, cartItem) => {
    return sum + getDiscountedItemTotal(cartItem.item as any, cartItem.quantity, promoCode);
  }, 0);

  const matchedItemsCount = state.items.filter((cartItem) => {
    const itemPromo = (cartItem.item as any).promo_code || '';
    const discount = (cartItem.item as any).discount ?? 0;
    return (
      promoCode &&
      discount > 0 &&
      itemPromo.trim().toLowerCase() === promoCode.trim().toLowerCase() &&
      cartItem.type === 'guide'
    );
  }).length;

  const totalSavings = Math.max(0, state.items.reduce((sum, cartItem) => {
    const original = (cartItem.item as any).price * cartItem.quantity;
    const discounted = getDiscountedItemTotal(cartItem.item as any, cartItem.quantity, promoCode);
    return sum + (original - discounted);
  }, 0));

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
          amount: getDiscountedItemTotal(item.item as any, item.quantity, promoCode),
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
          totalAmount: discountedTotal,
          promoCode: promoCode || null,
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
    amount: Math.round(discountedTotal * 100), // Paystack expects amount in kobo
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
                      <div className="text-right">
                        <span className="font-medium text-gray-900 block">
                          {formatPrice(item.item.price * item.quantity)}
                        </span>
                        {promoCode && getDiscountedItemTotal(item.item as any, item.quantity, promoCode) < (item.item.price * item.quantity) && (
                          <span className="text-sm text-green-600 block">
                            Promo applied: -{formatPrice((item.item.price * item.quantity) - getDiscountedItemTotal(item.item as any, item.quantity, promoCode))}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="promo">Promo Code</Label>
                    <Input
                      id="promo"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                    />
                    {promoCode && (
                      <p className={`text-sm ${matchedItemsCount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {matchedItemsCount > 0
                          ? `Promo applied to ${matchedItemsCount} item${matchedItemsCount > 1 ? 's' : ''}. Savings: ${formatPrice(totalSavings)}`
                          : 'Invalid promo code'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-pink-600">{formatPrice(discountedTotal)}</span>
                  </div>
                </div>

                {/* PAYMENTS TEMPORARILY DISABLED */}
                <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-center space-y-2">
                  <p className="font-semibold text-yellow-800 text-sm">🚧 Online payments are temporarily unavailable</p>
                  <p className="text-yellow-700 text-sm">
                    Please contact us directly to complete your purchase.
                  </p>
                  <a
                    href="https://wa.me/27729324503"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-6 rounded-md transition-colors"
                  >
                    Contact us on WhatsApp
                  </a>
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
