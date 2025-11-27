import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuItem: item.id,
          quantity: item.quantity
        })),
        deliveryAddress: user.address || 'Manyanja Road, Nairobi',
        paymentMethod: 'mpesa',
        specialInstructions: ''
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Order placed successfully! You will receive an M-Pesa prompt shortly.');
        clearCart();
        navigate('/track-order');
      } else {
        alert('Failed to place order: ' + data.message);
      }
    } catch (error) {
      alert('Error placing order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">KES {item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-orange-600">KES {getCartTotal()}</span>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Address:</strong> {user.address || 'Manyanja Road, Nairobi'}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center space-x-3 p-4 border-2 border-orange-500 rounded-lg bg-orange-50">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <div>
                  <p className="font-semibold">M-Pesa</p>
                  <p className="text-sm text-gray-600">Pay via M-Pesa</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                You will receive an M-Pesa prompt on your phone to complete the payment.
              </p>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg"
            >
              Place Order - KES {getCartTotal()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;