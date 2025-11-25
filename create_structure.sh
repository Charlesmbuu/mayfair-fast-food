#!/bin/bash

# Create directories
mkdir -p backend/config
mkdir -p backend/middleware
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/utils

# Create files
touch backend/config/database.js
touch backend/middleware/auth.js
touch backend/middleware/roleCheck.js
touch backend/models/User.js
touch backend/models/MenuItem.js
touch backend/models/Order.js
touch backend/routes/auth.js
touch backend/routes/menu.js
touch backend/routes/orders.js
touch backend/utils/generateToken.js
touch backend/server.js

echo "Backend folder structure created successfully!"
