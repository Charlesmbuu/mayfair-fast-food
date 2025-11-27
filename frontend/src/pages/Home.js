import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/menu?category=Burgers`);
      setFeaturedItems(response.data.data.slice(0, 3));
    } catch (error) {
      toast.error('Failed to load featured items');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-orange to-orange-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-primary-green">May Fair</span> Fast Food
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Delicious meals delivered fast to your doorstep in Nairobi
            </p>
            <p className="text-lg mb-8 text-orange-200">
              Located at Manyanja Road - Serving quality since 2023
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/menu"
                className="bg-primary-green hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Order Now
              </Link>
              <Link
                to="/track-order"
                className="bg-white hover:bg-gray-100 text-primary-orange font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose May Fair?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to serving you the best fast food experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">
                Get your food delivered within 30-45 minutes anywhere in Nairobi
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Ingredients</h3>
              <p className="text-gray-600">
                We use only the freshest ingredients for all our meals
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Service</h3>
              <p className="text-gray-600">
                Friendly staff dedicated to making your experience amazing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Items
            </h2>
            <p className="text-xl text-gray-600">
              Check out some of our customer favorites
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden food-card">
                  <div className="h-48 bg-gradient-to-r from-primary-orange to-orange-400 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm">Ready in {item.preparationTime} mins</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary-orange">
                        KES {item.price}
                      </span>
                      <Link
                        to="/menu"
                        className="bg-primary-orange hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/menu"
              className="inline-block bg-primary-green hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-green text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Order Your Favorite Meal?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of satisfied customers in Nairobi who choose May Fair Fast Food
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="bg-primary-orange hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              Order Now
            </Link>
            <a
              href="tel:+254712345678"
              className="bg-white hover:bg-gray-100 text-primary-green font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
            >
              Call Us: +254 712 345 678
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;