import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuItem: item.id,
          quantity: item.quantity
        })),
        deliveryAddress: user.address || 'Manyanja Road, Nairobi',
        paymentMethod: 'mpesa'
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
        alert('Order placed successfully!');
        clearCart();
        navigate('/track-order');
      } else {
        alert('Failed to place order: ' + data.message);
      }
    } catch (error) {
      alert('Error placing order');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious items from our menu!</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          {cartItems.map(item => (
            <div key={item.id} className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍔</span>
                </div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-orange-500 font-bold">KES {item.price}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >-</button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >+</button>
                </div>
                <div className="text-right min-w-20">
                  <p className="font-bold">KES {item.price * item.quantity}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold">Total:</span>
              <span className="text-2xl font-bold text-orange-500">KES {getCartTotal()}</span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={clearCart}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;