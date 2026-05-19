

-- Insert demo users (passwords need to be hashed with bcrypt before inserting)
-- Use: bcrypt.hash('demo123', 10) to generate hashed passwords

INSERT INTO users (id, email, password, full_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'buyer@demo.com', '$2b$10$8K1p/a0dL3LzZfBm1OZpZOaEfpV7a4X9XZj2fK0qGVl4x3C7oXYYe', 'Demo Buyer', 'buyer'),
    ('550e8400-e29b-41d4-a716-446655440002', 'seller@demo.com', '$2b$10$8K1p/a0dL3LzZfBm1OZpZOaEfpV7a4X9XZj2fK0qGVl4x3C7oXYYe', 'Demo Seller', 'seller')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products with images
INSERT INTO products (name, description, price, category, seller_id, sizes, colors, stock_quantity, in_stock, image_url) VALUES
    ('Classic White Tee', 'Premium cotton basic tee', 2999, 'Tops', '550e8400-e29b-41d4-a716-446655440002', ARRAY['S','M','L','XL'], ARRAY['White','Black'], 100, true, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80'),
    ('Wool Beanie', 'Warm winter beanie', 2499, 'Accessories', '550e8400-e29b-41d4-a716-446655440002', ARRAY['One Size'], ARRAY['Grey','Black','Navy'], 50, true, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop&q=80'),
    ('Leather Jacket', 'Genuine leather biker jacket', 89999, 'Outerwear', '550e8400-e29b-41d4-a716-446655440002', ARRAY['S','M','L','XL'], ARRAY['Black','Brown'], 20, true, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop&q=80'),
    ('Slim Fit Jeans', 'Classic denim jeans', 4999, 'Bottoms', '550e8400-e29b-41d4-a716-446655440002', ARRAY['28','30','32','34','36'], ARRAY['Blue','Black'], 75, true, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop&q=80'),
    ('Summer Dress', 'Floral print sundress', 5999, 'Dresses', '550e8400-e29b-41d4-a716-446655440002', ARRAY['XS','S','M','L'], ARRAY['Floral','White'], 40, true, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop&q=80');