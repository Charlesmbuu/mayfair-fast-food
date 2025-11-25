import React from 'react';

const CartSummary = ({ items, total, onProceedToCheckout }) => {
  const deliveryFee = total > 0 ? 200 : 0; // Example delivery fee
  const finalTotal = total + deliveryFee;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">KSh {total.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-semibold">KSh {deliveryFee.toLocaleString()}</span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-orange-600">KSh {finalTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onProceedToCheckout}
        disabled={items.length === 0}
        className="w-full mt-6 bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;