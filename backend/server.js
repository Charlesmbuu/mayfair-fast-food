const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Home route
app.get('/', (req, res) => {
  res.json({ 
    message: '🍔 May Fair Fast Food API is running!',
    version: '1.0.0',
    endpoints: {
      menu: '/api/menu',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mayfair-food', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🍔 May Fair Fast Food API Ready!`);
  console.log(`📍 Manyanja Road, Nairobi`);
});