import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { menuAPI } from '../services/api';
import MenuCategory from './MenuCategory';
import { useCart } from '../context/CartContext';

const MenuPage = () => {
  const { addItem } = useCart();
  const { data, loading, error } = useApi(() => menuAPI.getMenu());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      inventory_count: item.inventory_count,
    });
  };

  // Filter and search logic
  const filteredCategories = data?.data
    ?.map(category => ({
      ...category,
      items: category.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).filter(item =>
        selectedCategory ? category.category_id === selectedCategory : true
      )
    }))
    .filter(category => category.items.length > 0) || [];

  // Get unique categories for filter
  const categories = data?.data || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-4">Error loading menu</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filter Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div>
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No menu items found</div>
            <p className="text-gray-400 mt-2">
              {searchTerm || selectedCategory
                ? 'Try adjusting your search or filter criteria'
                : 'Menu items will appear here once available'}
            </p>
          </div>
        ) : (
          filteredCategories.map(category => (
            <MenuCategory
              key={category.category_id}
              category={category}
              onAddToCart={handleAddToCart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MenuPage;