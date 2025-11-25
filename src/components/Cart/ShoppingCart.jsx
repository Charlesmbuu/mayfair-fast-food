import React from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

const ShoppingCart = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { items, updateQuantity, removeItem, getCartTotal, clearCart } = useCart();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-md h-full overflow-y-auto transform transition-transform">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">Your cart is empty</div>
                <p className="text-gray-500">Add some delicious items from our menu!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {items.length > 0 && (
            <div className="mt-8">
              <CartSummary
                items={items}
                total={getCartTotal()}
                onProceedToCheckout={onProceedToCheckout}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;