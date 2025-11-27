const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

const sampleMenuItems = [
  // Burgers
  {
    name: "Classic Beef Burger",
    description: "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
    price: 450,
    category: "Burgers",
    ingredients: ["Beef Patty", "Lettuce", "Tomato", "Cheese", "Special Sauce", "Bun"],
    preparationTime: 10,
    spicyLevel: "Mild"
  },
  {
    name: "Cheese Burger Deluxe",
    description: "Double beef patty with double cheese, bacon, and crispy onions",
    price: 650,
    category: "Burgers",
    ingredients: ["Double Beef Patty", "Double Cheese", "Bacon", "Crispy Onions", "Special Sauce", "Bun"],
    preparationTime: 12,
    spicyLevel: "Mild"
  },
  {
    name: "Spicy Chicken Burger",
    description: "Crispy chicken fillet with spicy mayo and fresh vegetables",
    price: 500,
    category: "Burgers",
    ingredients: ["Chicken Fillet", "Spicy Mayo", "Lettuce", "Pickles", "Bun"],
    preparationTime: 8,
    spicyLevel: "Medium"
  },

  // Chicken
  {
    name: "Crispy Fried Chicken",
    description: "4 pieces of our signature crispy fried chicken with secret spices",
    price: 800,
    category: "Chicken",
    ingredients: ["Chicken Pieces", "Secret Spices", "Flour Coating"],
    preparationTime: 15,
    spicyLevel: "Medium"
  },
  {
    name: "Chicken Wings (6 pcs)",
    description: "Six pieces of juicy chicken wings with your choice of sauce",
    price: 550,
    category: "Chicken",
    ingredients: ["Chicken Wings", "Choice of Sauce"],
    preparationTime: 12,
    spicyLevel: "Hot"
  },
  {
    name: "Grilled Chicken Breast",
    description: "Healthy grilled chicken breast with herbs and lemon",
    price: 600,
    category: "Chicken",
    ingredients: ["Chicken Breast", "Herbs", "Lemon", "Olive Oil"],
    preparationTime: 10,
    spicyLevel: "Mild"
  },

  // Pizza
  {
    name: "Pepperoni Pizza",
    description: "Classic pizza with pepperoni and mozzarella cheese",
    price: 950,
    category: "Pizza",
    ingredients: ["Pizza Dough", "Pepperoni", "Mozzarella", "Tomato Sauce"],
    preparationTime: 20,
    spicyLevel: "Mild"
  },
  {
    name: "BBQ Chicken Pizza",
    description: "Grilled chicken with BBQ sauce, onions, and cilantro",
    price: 1100,
    category: "Pizza",
    ingredients: ["Pizza Dough", "Grilled Chicken", "BBQ Sauce", "Onions", "Cilantro"],
    preparationTime: 18,
    spicyLevel: "Mild"
  },
  {
    name: "Vegetarian Pizza",
    description: "Fresh vegetables with olives and feta cheese",
    price: 900,
    category: "Pizza",
    ingredients: ["Pizza Dough", "Bell Peppers", "Mushrooms", "Olives", "Feta Cheese"],
    preparationTime: 15,
    spicyLevel: "Mild"
  },

  // Sides
  {
    name: "French Fries",
    description: "Crispy golden fries served with ketchup",
    price: 250,
    category: "Sides",
    ingredients: ["Potatoes", "Salt", "Oil"],
    preparationTime: 5,
    spicyLevel: "Mild"
  },
  {
    name: "Onion Rings",
    description: "Crispy battered onion rings with dipping sauce",
    price: 300,
    category: "Sides",
    ingredients: ["Onions", "Batter", "Oil"],
    preparationTime: 7,
    spicyLevel: "Mild"
  },
  {
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs",
    price: 200,
    category: "Sides",
    ingredients: ["Bread", "Garlic Butter", "Herbs"],
    preparationTime: 4,
    spicyLevel: "Mild"
  },

  // Drinks
  {
    name: "Soda (500ml)",
    description: "Your choice of Coca-Cola, Fanta, or Sprite",
    price: 120,
    category: "Drinks",
    ingredients: ["Soda"],
    preparationTime: 1,
    spicyLevel: "Mild"
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    price: 180,
    category: "Drinks",
    ingredients: ["Oranges"],
    preparationTime: 3,
    spicyLevel: "Mild"
  },
  {
    name: "Bottled Water (500ml)",
    description: "Pure drinking water",
    price: 80,
    category: "Drinks",
    ingredients: ["Water"],
    preparationTime: 1,
    spicyLevel: "Mild"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mayfair-food');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'May Fair Admin',
      email: 'admin@mayfair.com',
      password: 'admin123',
      phone: '+254712345678',
      role: 'admin'
    });
    console.log('✅ Admin user created');

    // Create sample customer
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@example.com',
      password: 'customer123',
      phone: '+254700000000'
    });
    console.log('✅ Sample customer created');

    // Create menu items
    await MenuItem.create(sampleMenuItems);
    console.log('✅ Sample menu items created');

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('   Admin: admin@mayfair.com / admin123');
    console.log('   Customer: customer@example.com / customer123');
    console.log('\n🍔 May Fair Fast Food system is ready!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();