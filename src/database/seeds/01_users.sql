-- Seed data for users table
INSERT INTO users (email, encrypted_password, created_at, updated_at)
VALUES 
  ('test@gmail.com', '$2a$10$X7J3QZq3QZq3QZq3QZq3QO', NOW(), NOW()),
  ('test2@gmail.com', '$2a$10$X7J3QZq3QZq3QZq3QZq3QO', NOW(), NOW()); 