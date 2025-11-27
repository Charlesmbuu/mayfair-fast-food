import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">May Fair Fast Food</h1>
              <p className="text-xs text-gray-500">Manyanja Road, Nairobi</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-orange border-b-2 border-primary-orange' 
                  : 'text-gray-700 hover:text-primary-orange'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/menu') 
                  ? 'text-primary-orange border-b-2 border-primary-orange' 
                  : 'text-gray-700 hover:text-primary-orange'
              }`}
            >
              Menu
            </Link>
            {user && (
              <Link 
                to="/track-order" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/track-order') 
                    ? 'text-primary-orange border-b-2 border-primary-orange' 
                    : 'text-gray-700 hover:text-primary-orange'
                }`}
              >
                Track Order
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin') 
                    ? 'text-primary-orange border-b-2 border-primary-orange' 
                    : 'text-gray-700 hover:text-primary-orange'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-700 hover:text-primary-orange transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-orange transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{user.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b">
                      {user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-orange transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-orange rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="px-3 py-2 text-gray-700 hover:text-primary-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/menu" 
                className="px-3 py-2 text-gray-700 hover:text-primary-orange transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Menu
              </Link>
              {user && (
                <Link 
                  to="/track-order" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Track Order
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="px-3 py-2 text-gray-700 hover:text-primary-orange transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              {!user && (
                <>
                  <Link 
                    to="/login" 
                    className="px-3 py-2 text-gray-700 hover:text-primary-orange transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-3 py-2 text-primary-orange hover:text-orange-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;