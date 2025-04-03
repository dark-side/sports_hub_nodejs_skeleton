import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/config';
import { users } from '../models/schema';
import { eq } from 'drizzle-orm';

const app = new Hono();

app
  .post('/register', async (c) => {
    try {
      const { email, password } = await c.req.json();
      const db = getDatabase();

      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existingUser.length > 0) {
        return c.json({ error: 'User already exists' }, 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [result] = await db.insert(users).values({
        email,
        encryptedPassword: hashedPassword,
      });

      // Generate token
      const token = jwt.sign(
        { userId: result.insertId },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' },
      );

      return c.json({
        message: 'User registered successfully',
        token,
        user: {
          id: result.insertId,
          email,
        },
      });
    } catch (error) {
      return c.json({ error: 'Registration failed' }, 500);
    }
  })
  .post('/login', async (c) => {
    try {
      const { email, password } = await c.req.json();
      const db = getDatabase();

      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.encryptedPassword);

      if (!isValidPassword) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      // Generate token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default-secret', {
        expiresIn: '24h',
      });

      return c.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      return c.json({ error: 'Login failed' }, 500);
    }
  });

export default app;
