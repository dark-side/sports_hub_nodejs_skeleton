-- Seed data for comments table
-- First, insert initial comments for each article
INSERT INTO comments (content, article_id, created_at, updated_at)
SELECT 
  CASE 
    WHEN a.id = 1 THEN 'This article was very informative and helpful.'
    WHEN a.id = 2 THEN 'I learned a lot from this article and will definitely be using the tips.'
    WHEN a.id = 3 THEN 'Great article! I will be sharing this with my friends.'
    WHEN a.id = 4 THEN 'I loved this article and will be reading more from this author.'
    WHEN a.id = 5 THEN 'This article was very well-written and easy to understand.'
    WHEN a.id = 6 THEN 'I will be recommending this article to everyone I know.'
  END,
  a.id,
  NOW(),
  NOW()
FROM articles a;

-- Insert additional random comments
INSERT INTO comments (content, article_id, created_at, updated_at)
SELECT 
  CASE FLOOR(RAND() * 10)
    WHEN 0 THEN 'This article was very informative and helpful.'
    WHEN 1 THEN 'I learned a lot from this article and will definitely be using the tips.'
    WHEN 2 THEN 'Great article! I will be sharing this with my friends.'
    WHEN 3 THEN 'I loved this article and will be reading more from this author.'
    WHEN 4 THEN 'This article was very well-written and easy to understand.'
    WHEN 5 THEN 'I will be recommending this article to everyone I know.'
    WHEN 6 THEN 'I learned so much from this article and will be using the tips in my own life.'
    WHEN 7 THEN 'This article was very helpful and informative.'
    WHEN 8 THEN 'I loved this article and will be reading more from this author.'
    WHEN 9 THEN 'I will be recommending this article to everyone I know.'
  END,
  a.id,
  NOW(),
  NOW()
FROM articles a
CROSS JOIN (SELECT 1 UNION SELECT 2 UNION SELECT 3) AS numbers
WHERE RAND() < 0.5; -- This will randomly select about half of the possible combinations 