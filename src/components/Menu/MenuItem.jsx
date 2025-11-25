import React from 'react';
import { Plus } from 'lucide-react';

const MenuItem = ({ item, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Item Image */}
      <div className="aspect-w-16 aspect-h-12 bg-gray-200">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
          <span className="font-bold text-orange-600 text-lg">
            KSh {item.price.toLocaleString()}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Inventory Status */}
        <div className="flex justify-between items-center mb-3">
          <span className={`text-sm ${
            item.is_available && item.inventory_count > 0
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {item.is_available && item.inventory_count > 0
              ? `${item.inventory_count} in stock`
              : 'Out of stock'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(item)}
          disabled={!item.is_available || item.inventory_count === 0}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={18} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default MenuItem;