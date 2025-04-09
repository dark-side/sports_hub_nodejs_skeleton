import { promises as fs } from 'fs';
import path from 'path';
import { initializeDatabase, getDatabase } from '../config';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Seed database with test data
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Initialize the database connection
    await initializeDatabase();
    const db = getDatabase();
    
    // Get direct MySQL connection to execute raw SQL
    const connection = await mysql.createConnection(process.env.DATABASE_URL || '');
    
    // Get all SQL files from the seeds directory
    const seedsDir = path.join(__dirname);
    const files = (await fs.readdir(seedsDir))
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure correct order (01_, 02_, etc.)
    
    console.log(`Found ${files.length} seed files to execute`);
    
    // Execute each SQL file
    for (const file of files) {
      console.log(`Executing seed file: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      // Split the SQL by semicolon to handle multiple statements
      const statements = sql
        .split(';')
        .map(statement => statement.trim())
        .filter(statement => statement.length > 0);
      
      for (const statement of statements) {
        await connection.query(statement);
      }
      
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('Database seeding completed successfully!');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 