import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/config';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.insert(users).values({
      email,
      encryptedPassword: hashedPassword,
    });

    // Get created user
    const [user] = await db.select().from(users).where(eq(users.id, result.insertId));

    // Generate JWT token
    const jwtId = Date.now().toString();
    const jwtPayload = { userId: user.id, email: user.email, jti: jwtId };
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(jwtPayload, secretKey, { expiresIn: '24h' });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.encryptedPassword);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const jwtId = Date.now().toString();
    const jwtPayload = { userId: user.id, email: user.email, jti: jwtId };
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(jwtPayload, secretKey, { expiresIn: '24h' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;
