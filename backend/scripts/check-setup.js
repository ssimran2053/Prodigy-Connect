#!/usr/bin/env node

/**
 * Setup Checker for Prodigy Connect Backend
 * Run this to verify your environment is configured correctly
 * 
 * Usage: node scripts/check-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function check(condition, successMsg, failMsg) {
  if (condition) {
    log(`✓ ${successMsg}`, 'green');
    return true;
  } else {
    log(`✗ ${failMsg}`, 'red');
    return false;
  }
}

async function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  return check(
    major >= 16,
    `Node.js version ${version} (>= 16 required)`,
    `Node.js version ${version} is too old. Please upgrade to v16 or higher`
  );
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (fs.existsSync(envPath)) {
    log('✓ .env file exists', 'green');
    return true;
  } else {
    log('✗ .env file not found', 'red');
    if (fs.existsSync(envExamplePath)) {
      log('  → Copy .env.example to .env and configure it', 'yellow');
      log('  → Command: cp .env.example .env', 'cyan');
    }
    return false;
  }
}

function checkEnvVariables() {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV'
  ];

  let allPresent = true;

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✓ ${varName} is set`, 'green');
    } else {
      log(`✗ ${varName} is not set in .env`, 'red');
      allPresent = false;
    }
  });

  return allPresent;
}

function checkDirectories() {
  const requiredDirs = [
    'config',
    'controllers',
    'middleware',
    'models',
    'routes',
    'scripts'
  ];

  let allExist = true;

  requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      log(`✓ ${dir}/ directory exists`, 'green');
    } else {
      log(`✗ ${dir}/ directory not found`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

function checkRequiredFiles() {
  const requiredFiles = [
    'server.js',
    'package.json',
    'config/database.js',
    'middleware/auth.js',
    'middleware/errorHandler.js'
  ];

  let allExist = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file} exists`, 'green');
    } else {
      log(`✗ ${file} not found`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

function checkPackageJson() {
  try {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredDeps = [
      'express',
      'mongoose',
      'dotenv',
      'cors',
      'jsonwebtoken',
      'bcryptjs'
    ];

    let allPresent = true;

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log(`✓ ${dep} is installed`, 'green');
      } else {
        log(`✗ ${dep} is not installed`, 'red');
        allPresent = false;
      }
    });

    return allPresent;
  } catch (error) {
    log('✗ Could not read package.json', 'red');
    return false;
  }
}

async function checkMongoDB() {
  try {
    const { default: mongoose } = await import('mongoose');
    
    log('⏳ Checking MongoDB connection...', 'yellow');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prodigy-connect', {
      serverSelectionTimeoutMS: 5000
    });
    
    log('✓ MongoDB connection successful', 'green');
    await mongoose.connection.close();
    return true;
  } catch (error) {
    log('✗ MongoDB connection failed', 'red');
    log(`  → Error: ${error.message}`, 'red');
    log('  → Make sure MongoDB is running', 'yellow');
    log('  → Check MONGODB_URI in .env', 'yellow');
    return false;
  }
}

async function checkServerPort() {
  const port = process.env.PORT || 5000;
  
  try {
    const { default: net } = await import('net');
    
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log(`✗ Port ${port} is already in use`, 'red');
          log('  → Stop any running servers or use a different port', 'yellow');
          resolve(false);
        }
      });
      
      server.once('listening', () => {
        server.close();
        log(`✓ Port ${port} is available`, 'green');
        resolve(true);
      });
      
      server.listen(port);
    });
  } catch (error) {
    log(`✗ Could not check port ${port}`, 'red');
    return false;
  }
}

async function main() {
  console.log('\n' + '═'.repeat(60));
  log('🔍 PRODIGY CONNECT SETUP CHECKER', 'cyan');
  console.log('═'.repeat(60) + '\n');

  // Load .env if it exists
  try {
    const dotenv = await import('dotenv');
    dotenv.config({ path: path.join(__dirname, '..', '.env') });
  } catch (error) {
    // dotenv not installed yet
  }

  let allChecks = true;

  // Run checks
  log('\n📦 Checking Node.js...', 'blue');
  allChecks = await checkNodeVersion() && allChecks;

  log('\n📁 Checking project structure...', 'blue');
  allChecks = checkDirectories() && allChecks;
  allChecks = checkRequiredFiles() && allChecks;

  log('\n📝 Checking configuration...', 'blue');
  allChecks = checkEnvFile() && allChecks;
  
  if (checkEnvFile()) {
    allChecks = checkEnvVariables() && allChecks;
  }

  log('\n📦 Checking dependencies...', 'blue');
  allChecks = checkPackageJson() && allChecks;

  log('\n🔌 Checking connections...', 'blue');
  if (process.env.MONGODB_URI || fs.existsSync(path.join(__dirname, '..', '.env'))) {
    allChecks = await checkMongoDB() && allChecks;
  } else {
    log('⚠ Skipping MongoDB check (no connection string found)', 'yellow');
  }

  allChecks = await checkServerPort() && allChecks;

  // Summary
  console.log('\n' + '═'.repeat(60));
  log('📊 SUMMARY', 'cyan');
  console.log('═'.repeat(60));

  if (allChecks) {
    log('\n🎉 All checks passed! Your environment is ready.', 'green');
    log('\nNext steps:', 'blue');
    log('  1. npm run seed    (optional - add sample data)', 'cyan');
    log('  2. npm run dev     (start development server)', 'cyan');
    log('  3. npm test        (run API tests)', 'cyan');
  } else {
    log('\n⚠️  Some checks failed. Please fix the issues above.', 'yellow');
    log('\nQuick fixes:', 'blue');
    log('  • Missing .env?        → cp .env.example .env', 'cyan');
    log('  • Missing packages?    → npm install', 'cyan');
    log('  • MongoDB not running? → brew services start mongodb-community', 'cyan');
    log('  • Port in use?         → Change PORT in .env', 'cyan');
  }

  console.log('\n' + '═'.repeat(60) + '\n');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
