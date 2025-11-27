const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

class SimpleDB {
  constructor() {
    this.dataFile = path.join(__dirname, 'data.json');
    this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf8');
        this.data = JSON.parse(data);
      } else {
        // Initialize with sample data
        this.data = {
          users: [],
          menuItems: [],
          orders: []
        };
        this.createSampleData();
        this.saveData();
      }
    } catch (error) {
      console.log('Creating new database...');
      this.data = {
        users: [],
        menuItems: [],
        orders: []
      };
      this.createSampleData();
      this.saveData();
    }
  }

  saveData() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
  }

  createSampleData() {
    // Create admin user (password: admin123)
    const adminPassword = bcrypt.hashSync('admin123', 12);
    const customerPassword = bcrypt.hashSync('customer123', 12);

    this.data.users = [
      {
        id: '1',
        name: 'May Fair Admin',
        email: 'admin@mayfair.com',
        password: adminPassword,
        phone: '+254712345678',
        role: 'admin',
        createdAt: new Date()
      },
      {
        id: '2',
        name: 'John Customer',
        email: 'customer@example.com',
        password: customerPassword,
        phone: '+254700000000',
        role: 'customer',
        createdAt: new Date()
      }
    ];

    this.data.menuItems = [
      {
        id: '1',
        name: "Classic Beef Burger",
        description: "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
        price: 450,
        category: "Burgers",
        ingredients: ["Beef Patty", "Lettuce", "Tomato", "Cheese", "Special Sauce", "Bun"],
        preparationTime: 10,
        spicyLevel: "Mild",
        available: true,
        image: "/images/burger.jpg"
      },
      {
        id: '2',
        name: "Cheese Burger Deluxe",
        description: "Double beef patty with double cheese, bacon, and crispy onions",
        price: 650,
        category: "Burgers",
        ingredients: ["Double Beef Patty", "Double Cheese", "Bacon", "Crispy Onions", "Special Sauce", "Bun"],
        preparationTime: 12,
        spicyLevel: "Mild",
        available: true,
        image: "/images/cheese-burger.jpg"
      },
      {
        id: '3',
        name: "Spicy Chicken Burger",
        description: "Crispy chicken fillet with spicy mayo and fresh vegetables",
        price: 500,
        category: "Burgers",
        ingredients: ["Chicken Fillet", "Spicy Mayo", "Lettuce", "Pickles", "Bun"],
        preparationTime: 8,
        spicyLevel: "Medium",
        available: true,
        image: "/images/chicken-burger.jpg"
      },
      {
        id: '4',
        name: "Crispy Fried Chicken",
        description: "4 pieces of our signature crispy fried chicken with secret spices",
        price: 800,
        category: "Chicken",
        ingredients: ["Chicken Pieces", "Secret Spices", "Flour Coating"],
        preparationTime: 15,
        spicyLevel: "Medium",
        available: true,
        image: "/images/fried-chicken.jpg"
      },
      {
        id: '5',
        name: "Chicken Wings (6 pcs)",
        description: "Six pieces of juicy chicken wings with your choice of sauce",
        price: 550,
        category: "Chicken",
        ingredients: ["Chicken Wings", "Choice of Sauce"],
        preparationTime: 12,
        spicyLevel: "Hot",
        available: true,
        image: "/images/chicken-wings.jpg"
      },
      {
        id: '6',
        name: "Pepperoni Pizza",
        description: "Classic pizza with pepperoni and mozzarella cheese",
        price: 950,
        category: "Pizza",
        ingredients: ["Pizza Dough", "Pepperoni", "Mozzarella", "Tomato Sauce"],
        preparationTime: 20,
        spicyLevel: "Mild",
        available: true,
        image: "/images/pizza.jpg"
      },
      {
        id: '7',
        name: "French Fries",
        description: "Crispy golden fries served with ketchup",
        price: 250,
        category: "Sides",
        ingredients: ["Potatoes", "Salt", "Oil"],
        preparationTime: 5,
        spicyLevel: "Mild",
        available: true,
        image: "/images/fries.jpg"
      },
      {
        id: '8',
        name: "Soda (500ml)",
        description: "Your choice of Coca-Cola, Fanta, or Sprite",
        price: 120,
        category: "Drinks",
        ingredients: ["Soda"],
        preparationTime: 1,
        spicyLevel: "Mild",
        available: true,
        image: "/images/soda.jpg"
      }
    ];

    this.data.orders = [];
  }

  // User methods
  findUser(query) {
    return this.data.users.find(user => {
      if (query.email) return user.email === query.email;
      if (query.id) return user.id === query.id;
      return false;
    });
  }

  createUser(userData) {
    const user = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  // Menu methods
  findMenuItems(filter = {}) {
    let items = [...this.data.menuItems];
    if (filter.category && filter.category !== 'all') {
      items = items.filter(item => item.category === filter.category);
    }
    if (filter.available !== undefined) {
      items = items.filter(item => item.available === filter.available);
    }
    return items;
  }

  findMenuItemById(id) {
    return this.data.menuItems.find(item => item.id === id);
  }

  // Order methods
  createOrder(orderData) {
    const order = {
      id: Date.now().toString(),
      orderNumber: 'MF' + Date.now(),
      ...orderData,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + 45 * 60000)
    };
    this.data.orders.push(order);
    this.saveData();
    return order;
  }

  findOrders(filter = {}) {
    let orders = [...this.data.orders];
    if (filter.customer) {
      orders = orders.filter(order => order.customer === filter.customer);
    }
    return orders;
  }

  findOrderById(id) {
    return this.data.orders.find(order => order.id === id);
  }

  updateOrder(id, updates) {
    const order = this.findOrderById(id);
    if (order) {
      Object.assign(order, updates);
      this.saveData();
    }
    return order;
  }
}

module.exports = new SimpleDB();