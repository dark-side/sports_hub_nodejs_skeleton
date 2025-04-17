import express, { Request, Response } from 'express';
import { getDatabase } from '../database/config';
import { articles, images } from '../database/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Returns all articles with their associated images
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: The list of articles with image information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getDatabase();
    // Query articles and join with images
    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        shortDescription: articles.shortDescription,
        description: articles.description,
        imageId: articles.image_id,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        image: {
          id: images.id,
          image: images.image,
          imageAlt: images.imageAlt,
        },
      })
      .from(articles)
      .leftJoin(images, eq(articles.image_id, images.id));

    res.json(result);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

/**
 * @swagger
 * /articles/{articleId}:
 *   get:
 *     summary: Get an article by ID with its associated image
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The article ID
 *     responses:
 *       200:
 *         description: The article details with image information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: The article was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:articleId', async (req: Request, res: Response): Promise<void> => {
  try {
    const articleId = Number(req.params.articleId);
    const db = getDatabase();

    // Query article with its associated image
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        shortDescription: articles.shortDescription,
        description: articles.description,
        imageId: articles.image_id,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        image: {
          id: images.id,
          image: images.image,
          imageAlt: images.imageAlt,
        },
      })
      .from(articles)
      .leftJoin(images, eq(articles.image_id, images.id))
      .where(eq(articles.id, articleId));

    if (!article) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article with an optional image
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: The article title
 *               shortDescription:
 *                 type: string
 *                 description: A short description of the article
 *               description:
 *                 type: string
 *                 description: The full article content
 *               image:
 *                 type: string
 *                 description: Base64 encoded image data (must be provided together with imageAlt)
 *               imageAlt:
 *                 type: string
 *                 description: Alternative text for the image (must be provided together with image)
 *     responses:
 *       201:
 *         description: The article was successfully created with its image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       400:
 *         description: Invalid input - image and imageAlt must be provided together
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, shortDescription, description, image, imageAlt } = req.body;
    const db = getDatabase();

    // Use a transaction to ensure both image and article are created
    db.transaction(async (tx) => {
      let imageInsertId = null;
      if (image && imageAlt) {
        // Create the image
        const [imageResult] = await tx.insert(images).values({
          image,
          imageAlt,
        });
        imageInsertId = imageResult.insertId;
      } else {
        if (image || imageAlt) {
          console.error('Either specify image and imageAlt, or do not specify both');
          res
            .status(400)
            .json({ error: 'Either specify image and imageAlt, or do not specify both' });
          return;
        }
      }

      // Then create the article with a reference to the image
      const [articleResult] = await tx.insert(articles).values({
        title,
        shortDescription,
        description,
        image_id: imageInsertId,
      });

      // Get the created article with its image
      const [newArticle] = await tx
        .select({
          id: articles.id,
          title: articles.title,
          shortDescription: articles.shortDescription,
          description: articles.description,
          imageId: articles.image_id,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          image: {
            id: images.id,
            image: images.image,
            imageAlt: images.imageAlt,
          },
        })
        .from(articles)
        .leftJoin(images, eq(articles.image_id, images.id))
        .where(eq(articles.id, articleResult.insertId));

      res.status(201).json(newArticle);
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

/**
 * @swagger
 * /articles/{articleId}:
 *   patch:
 *     summary: Update parts of an article and its associated image
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The article title (optional, updated only if provided)
 *               shortDescription:
 *                 type: string
 *                 description: A short description of the article (optional, updated only if provided)
 *               description:
 *                 type: string
 *                 description: The full article content (optional, updated only if provided)
 *               image:
 *                 type: string
 *                 description: Base64 encoded image data (if article has no image, both image and imageAlt must be provided)
 *               imageAlt:
 *                 type: string
 *                 description: Alternative text for the image (if article has no image, both image and imageAlt must be provided)
 *     responses:
 *       200:
 *         description: The article was updated with its image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The article was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/:articleId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const articleId = Number(req.params.articleId);
    const { title, shortDescription, description, image, imageAlt } = req.body;
    const db = getDatabase();

    // Find the article to get its image ID
    const [existingArticle] = await db.select().from(articles).where(eq(articles.id, articleId));

    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Use transaction to update both article and image
    db.transaction(async (tx) => {
      if (title || shortDescription || description) {
        // Update article
        await tx
          .update(articles)
          .set({
            title,
            shortDescription,
            description,
          })
          .where(eq(articles.id, articleId));
      }

      // Update image if there's an associated image
      if (existingArticle.image_id && (image || imageAlt)) {
        const updateData: any = {};
        if (image) updateData.image = image;
        if (imageAlt) updateData.imageAlt = imageAlt;

        await tx.update(images).set(updateData).where(eq(images.id, existingArticle.image_id));
      }
      // Create new image if there isn't one but image data was provided
      else if (!existingArticle.image_id && (image || imageAlt)) {
        const [imageResult] = await tx.insert(images).values({
          image,
          imageAlt,
        });

        // Update article with new image ID
        await tx
          .update(articles)
          .set({
            image_id: imageResult.insertId,
          })
          .where(eq(articles.id, articleId));
      }

      // Get updated article with image
      const [updatedArticle] = await tx
        .select({
          id: articles.id,
          title: articles.title,
          shortDescription: articles.shortDescription,
          description: articles.description,
          imageId: articles.image_id,
          createdAt: articles.createdAt,
          updatedAt: articles.updatedAt,
          image: {
            id: images.id,
            image: images.image,
            imageAlt: images.imageAlt,
          },
        })
        .from(articles)
        .leftJoin(images, eq(articles.image_id, images.id))
        .where(eq(articles.id, articleId));

      res.json(updatedArticle);
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

/**
 * @swagger
 * /articles/{articleId}:
 *   delete:
 *     summary: Delete an article and its associated image
 *     tags: [Articles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The article ID
 *     responses:
 *       204:
 *         description: The article and its image were deleted
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The article was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:articleId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const articleId = Number(req.params.articleId);
    const db = getDatabase();

    // Find the article to get its image ID
    const [existingArticle] = await db.select().from(articles).where(eq(articles.id, articleId));

    if (!existingArticle) {
      res.status(404).json({ error: 'Article not found' });
      return;
    }

    // Use transaction to delete both article and image
    db.transaction(async (tx) => {
      // Delete article
      await tx.delete(articles).where(eq(articles.id, articleId));

      // Delete associated image if exists
      if (existingArticle.image_id) {
        await tx.delete(images).where(eq(images.id, existingArticle.image_id));
      }
    });

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
