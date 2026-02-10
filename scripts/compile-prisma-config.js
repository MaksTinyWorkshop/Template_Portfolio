#!/usr/bin/env node
/**
 * Generate a simple prisma.config.js from the TypeScript version
 * Since Prisma 7 has issues parsing complex compiled JS, we create a minimal version
 */

const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'prisma.config.js');

console.log('🔧 Generating prisma.config.js...');

// Create a minimal config using Prisma 7's defineConfig syntax
const config = `const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portfolio',
  },
});
`;

try {
  fs.writeFileSync(outputPath, config, 'utf8');
  console.log('✅ Successfully generated prisma.config.js');
  console.log(`📄 Output file created at: ${outputPath}`);
} catch (error) {
  console.error('❌ Failed to generate prisma.config.js:', error.message);
  process.exit(1);
}
