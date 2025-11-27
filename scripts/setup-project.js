const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 Setting up May Fair Fast Food System...');
console.log('📍 Manyanja Road, Nairobi');
console.log('');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function logStep(step, message) {
  console.log(`${colors.cyan}${step}${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.magenta}❌${colors.reset} ${message}`);
}

try {
  // Step 1: Check if Node.js is installed
  logStep('🔍', 'Checking Node.js installation...');
  const nodeVersion = execSync('node --version').toString().trim();
  logSuccess(`Node.js ${nodeVersion} detected`);

  // Step 2: Install backend dependencies
  logStep('📦', 'Installing backend dependencies...');
  process.chdir('backend');
  execSync('npm install', { stdio: 'inherit' });
  logSuccess('Backend dependencies installed');

  // Step 3: Install frontend dependencies
  logStep('📦', 'Installing frontend dependencies...');
  process.chdir('../frontend');
  execSync('npm install', { stdio: 'inherit' });
  logSuccess('Frontend dependencies installed');

  // Step 4: Check MongoDB
  logStep('🗄️', 'Checking MongoDB...');
  process.chdir('..');
  
  // Create .env files if they don't exist
  const backendEnvPath = path.join('backend', '.env');
  if (!fs.existsSync(backendEnvPath)) {
    const backendEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/mayfair-food

# JWT
JWT_SECRET=mayfair_fast_food_jwt_secret_${Date.now()}
JWT_EXPIRE=30d

# M-Pesa Sandbox (Demo - Replace with real credentials for production)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# Default Admin Credentials
ADMIN_EMAIL=admin@mayfair.com
ADMIN_PASSWORD=admin123
`;
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    logSuccess('Backend environment file created');
  }

  const frontendEnvPath = path.join('frontend', '.env');
  if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `REACT_APP_API_URL=http://localhost:5000/api
GENERATE_SOURCEMAP=false`;
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    logSuccess('Frontend environment file created');
  }

  // Step 5: Seed database
  logStep('🌱', 'Seeding database with sample data...');
  process.chdir('backend');
  execSync('npm run seed', { stdio: 'inherit' });
  logSuccess('Database seeded with sample data');

  // Step 6: Setup complete
  process.chdir('..');
  console.log('');
  console.log(`${colors.green}${colors.bright}🎉 SETUP COMPLETED SUCCESSFULLY!${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}${colors.bright}🚀 NEXT STEPS:${colors.reset}`);
  console.log('');
  console.log('1. Start the backend server:');
  console.log('   cd backend && npm start');
  console.log('');
  console.log('2. In a new terminal, start the frontend:');
  console.log('   cd frontend && npm start');
  console.log('');
  console.log('3. Open your browser and go to:');
  console.log('   http://localhost:3000');
  console.log('');
  console.log(`${colors.yellow}${colors.bright}📋 DEFAULT LOGIN CREDENTIALS:${colors.reset}`);
  console.log('   Admin:    admin@mayfair.com / admin123');
  console.log('   Customer: customer@example.com / customer123');
  console.log('');
  console.log(`${colors.green}${colors.bright}🍔 May Fair Fast Food system is ready!${colors.reset}`);
  console.log('📍 Manyanja Road, Nairobi');
  console.log('📞 +254 712 345 678');

} catch (error) {
  logError('Setup failed: ' + error.message);
  console.log('');
  console.log(`${colors.yellow}Troubleshooting tips:${colors.reset}`);
  console.log('1. Make sure Node.js version 14 or higher is installed');
  console.log('2. Ensure MongoDB is running on your system');
  console.log('3. Check your internet connection');
  console.log('4. Try running the setup steps manually');
  process.exit(1);
}