import React from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = ({ onCartClick, user }) => {
  const { getCartItemsCount } = useCart();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-600">
              FoodOrder
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2 text-gray-700">
                <User size={20} />
                <span className="hidden sm:inline">
                  Hello, {user.profile?.first_name || user.email}
                </span>
              </div>
            )}

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-700 hover:text-orange-600 transition-colors"
            >
              <ShoppingCart size={24} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;