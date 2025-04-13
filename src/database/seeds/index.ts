import { promises as fs } from 'fs';
import path from 'path';
import { initializeDatabase } from '../config';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { saveArticlesSqlFile } from './utils';

// Load environment variables
dotenv.config();

/**
 * Seed database with test data
 */
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // First, regenerate the articles SQL file with base64 images
    console.log('Generating articles SQL with image data...');
    await saveArticlesSqlFile();
    
    // Initialize the database connection
    await initializeDatabase();
    
    // Get direct MySQL connection to execute raw SQL
    const connection = await mysql.createConnection(process.env.DATABASE_URL || '');
    
    // Set session variables to handle large data
    await connection.query('SET SESSION net_read_timeout=120'); // 2 minutes
    await connection.query('SET SESSION net_write_timeout=120'); // 2 minutes
    await connection.query('SET SESSION wait_timeout=180'); // 3 minutes
    
    try {
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
        
        // Skip empty files
        if (!sql.trim()) {
          console.log(`Skipping empty file: ${file}`);
          continue;
        }
        
        // Try to execute the file
        try {
          const statements: string[] = [];
          let currentStatement = '';
          let inString = false;
          
          for (let i = 0; i < sql.length; i++) {
            const char = sql[i];
            
            // Track if we're inside a string literal
            if (char === "'" && (i === 0 || sql[i - 1] !== '\\')) {
              inString = !inString;
            }
            
            currentStatement += char;
            
            // Only consider semicolons outside of string literals as statement separators
            if (char === ';' && !inString) {
              const trimmedStatement = currentStatement.trim();
              if (trimmedStatement) {
                statements.push(trimmedStatement);
              }
              currentStatement = '';
            }
          }
          
          // Add the last statement if there is one
          if (currentStatement.trim()) {
            statements.push(currentStatement.trim());
          }
          
          // Execute each statement with appropriate timeout
          for (const statement of statements) {
            if (statement.length > 0) {
              try {
                await connection.query({
                  sql: statement,
                  timeout: 60000 // 60 second timeout for each query
                });
              } catch (error) {
                console.error(`Error executing statement: ${(error as Error).message}`);
                console.error(`Statement starts with: ${statement.substring(0, 100)}...`);
                throw error;
              }
            }
          }
          
          console.log(`✅ Completed: ${file}`);
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
          throw error;
        }
      }
    } catch (sqlError) {
      console.error('Error executing SQL files:', sqlError);
      
      // Reset any partially applied seeds
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
      await connection.query('TRUNCATE TABLE articles;');
      await connection.query('TRUNCATE TABLE likes;');
      await connection.query('TRUNCATE TABLE comments;');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
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