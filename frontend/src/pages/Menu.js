import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories] = useState(['All', 'Burgers', 'Chicken', 'Pizza', 'Sides', 'Drinks']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === activeCategory));
    }
  }, [activeCategory, menuItems]);

  const fetchMenuItems = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/menu`);
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-xl text-gray-600">
            Delicious meals made with the finest ingredients
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-primary-orange text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <div key={item._id} className="bg-white rounded-xl shadow-md overflow-hidden food-card">
              <div className="h-48 bg-gradient-to-r from-primary-orange to-orange-400 flex items-center justify-center relative">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm">{item.preparationTime} mins</p>
                </div>
                {item.spicyLevel !== 'Mild' && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {item.spicyLevel}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-2xl font-bold text-primary-orange">
                    KES {item.price}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredients:</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.ingredients.slice(0, 3).map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {ingredient}
                      </span>
                    ))}
                    {item.ingredients.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        +{item.ingredients.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-primary-green hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;