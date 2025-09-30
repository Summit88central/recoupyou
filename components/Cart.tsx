"use client";
import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Cart: React.FC = () => {
  const { state, removeItem, updateQuantity, closeCart, itemCount } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price);
  };

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/10 backdrop-blur-sm"
        onClick={closeCart}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
            <button
              onClick={closeCart}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBag className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Add some guides to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {'title' in item.item ? item.item.title : item.item.name}
                      </h3>
                      {item.type === 'guide' && 'description' in item.item && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.item.description?.substring(0, 60)}...
                        </p>
                      )}
                      <p className="text-sm font-medium text-pink-600 mt-1">
                        {formatPrice(item.item.price)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-md p-1 text-red-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(state.total)}
                </span>
              </div>
              
              <Link href="/checkout" onClick={() => { setIsCheckingOut(true); closeCart(); }}>
                <Button 
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  disabled={isCheckingOut}
            >
              {isCheckingOut && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isCheckingOut ? "Redirecting..." : "Proceed to Checkout"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;