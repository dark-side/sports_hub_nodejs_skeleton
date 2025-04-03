import { Hono } from 'hono';
import { getDatabase } from '../database/config';
import { articles } from '../models/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.middleware';

const app = new Hono();

app
  .get('/', async (c) => {
    try {
      const db = getDatabase();
      const result = await db.select().from(articles);
      return c.json(result);
    } catch (error) {
      return c.json({ error: 'Failed to fetch articles' }, 500);
    }
  })
  .get('/:articleId', async (c) => {
    try {
      const articleId = Number(c.req.param('articleId'));
      const db = getDatabase();
      const [article] = await db.select().from(articles).where(eq(articles.id, articleId));

      if (!article) {
        return c.json({ error: 'Article not found' }, 404);
      }

      return c.json(article);
    } catch (error) {
      return c.json({ error: 'Failed to fetch article' }, 500);
    }
  })
  .post('/', authMiddleware, async (c) => {
    try {
      const { title, shortDescription, description } = await c.req.json();
      const db = getDatabase();

      const [result] = await db.insert(articles).values({
        title,
        shortDescription,
        description,
      });

      const [article] = await db.select().from(articles).where(eq(articles.id, result.insertId));
      return c.json(article);
    } catch (error) {
      return c.json({ error: 'Failed to create article' }, 500);
    }
  })
  .patch('/:articleId', authMiddleware, async (c) => {
    try {
      const articleId = Number(c.req.param('articleId'));
      const { title, shortDescription, description } = await c.req.json();
      const db = getDatabase();

      const [result] = await db
        .update(articles)
        .set({
          title,
          shortDescription,
          description,
        })
        .where(eq(articles.id, articleId));

      if (!result.affectedRows) {
        return c.json({ error: 'Article not found' }, 404);
      }

      const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
      return c.json(article);
    } catch (error) {
      return c.json({ error: 'Failed to update article' }, 500);
    }
  })
  .put('/:articleId', authMiddleware, async (c) => {
    try {
      const articleId = Number(c.req.param('articleId'));
      const { title, shortDescription, description } = await c.req.json();
      const db = getDatabase();

      const [result] = await db
        .update(articles)
        .set({
          title,
          shortDescription,
          description,
        })
        .where(eq(articles.id, articleId));

      if (!result.affectedRows) {
        return c.json({ error: 'Article not found' }, 404);
      }

      const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
      return c.json(article);
    } catch (error) {
      return c.json({ error: 'Failed to update article' }, 500);
    }
  });

export default app;
