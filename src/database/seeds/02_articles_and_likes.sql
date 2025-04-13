-- Seed data for articles and likes tables
INSERT INTO articles (title, short_description, description, image_id, created_at, updated_at)
VALUES
  ('The Art of Scoring Goals', 'Learn how to score goals like a pro with this comprehensive guide to the art of goal-scoring.', 'This is the description of the article with title: The Art of Scoring Goals', 1, NOW(), NOW()),
  ('Mastering the Perfect Serve', 'Master the perfect serve with this step-by-step guide to serving in tennis.', 'This is the description of the article with title: Mastering the Perfect Serve', 2, NOW(), NOW()),
  ('Unleashing Your Inner Athlete', 'Unleash your inner athlete with this guide to becoming the best athlete you can be.', 'This is the description of the article with title: Unleashing Your Inner Athlete', 3, NOW(), NOW()),
  ('The Science of Sports Performance', 'Discover the science behind sports performance and how to improve your game.', 'This is the description of the article with title: The Science of Sports Performance', 4, NOW(), NOW()),
  ('Achieving Victory Through Teamwork', 'Achieve victory through teamwork with this guide to working together as a team.', 'This is the description of the article with title: Achieving Victory Through Teamwork', 5, NOW(), NOW()),
  ('Exploring the World of Extreme Sports', 'Explore the world of extreme sports and learn how to get started with this guide.', 'This is the description of the article with title: Exploring the World of Extreme Sports', 6, NOW(), NOW());

-- Insert likes for each article
INSERT INTO likes (likes, dislikes, likeable_type, likeable_id, created_at, updated_at)
SELECT 
  FLOOR(RAND() * 101),
  FLOOR(RAND() * 101),
  'Article',
  id,
  NOW(),
  NOW()
FROM articles;