import React from 'react';
import MenuItem from './MenuItem';

const MenuCategory = ({ category, onAddToCart }) => {
  if (!category.items || category.items.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-orange-500 pb-2">
          {category.category_name}
        </h2>
        {category.items[0]?.category_description && (
          <p className="text-gray-600 mt-2">{category.items[0].category_description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.items.map((item) => (
          <MenuItem
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default MenuCategory;