-- Update products with appropriate images based on their descriptions
-- Using Unsplash for high-quality fashion images
-- This migration updates existing products that may not have images

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80'
WHERE name = 'Classic White Tee' AND (image_url IS NULL OR image_url = '');

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop&q=80'
WHERE name = 'Wool Beanie' AND (image_url IS NULL OR image_url = '');

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop&q=80'
WHERE name = 'Leather Jacket' AND (image_url IS NULL OR image_url = '');

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop&q=80'
WHERE name = 'Slim Fit Jeans' AND (image_url IS NULL OR image_url = '');

UPDATE products 
SET image_url = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop&q=80'
WHERE name = 'Summer Dress' AND (image_url IS NULL OR image_url = '');

