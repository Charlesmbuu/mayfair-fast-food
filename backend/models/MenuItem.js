const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Burgers', 'Chicken', 'Pizza', 'Sides', 'Drinks']
  },
  image: {
    type: String,
    default: '/images/food-placeholder.jpg'
  },
  available: {
    type: Boolean,
    default: true
  },
  ingredients: [String],
  preparationTime: {
    type: Number,
    default: 15
  },
  spicyLevel: {
    type: String,
    enum: ['Mild', 'Medium', 'Hot', 'Very Hot'],
    default: 'Mild'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);