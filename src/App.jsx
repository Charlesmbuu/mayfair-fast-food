import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout/Layout';
import MenuPage from './components/Menu/MenuPage';
import ShoppingCart from './components/Cart/ShoppingCart';
import CheckoutPage from './components/Checkout/CheckoutPage';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState('menu'); // 'menu', 'checkout'

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    setCurrentView('checkout');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // For demo purposes - in production, you'd have proper authentication
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Layout user={user} onCartClick={() => setCartOpen(true)}>
            {currentView === 'menu' && <MenuPage />}
            {currentView === 'checkout' && (
              <CheckoutPage
                onBack={handleBackToMenu}
                restaurantId="your-restaurant-id" // This should come from context or props
              />
            )}
          </Layout>

          <ShoppingCart
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;