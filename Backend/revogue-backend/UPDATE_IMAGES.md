# Update Product Images

To add images to products, you have several options:

## Option 1: Use the API Endpoint (Easiest)

1. Make sure your backend server is running
2. Open your browser or use curl/Postman
3. Make a POST request to: `http://localhost:3001/products/update-images`

**Using curl:**
```bash
curl -X POST http://localhost:3001/products/update-images
```

**Using browser:**
Just visit: http://localhost:3001/products/update-images

## Option 2: Run the SQL Migration

1. Connect to your PostgreSQL database
2. Run the SQL from `migrations/003_add_product_images.sql`

**Using psql:**
```bash
psql -U postgres -d revogue -f migrations/003_add_product_images.sql
```

**Or manually in psql:**
```sql
\c revogue
\i migrations/003_add_product_images.sql
```

## Option 3: Use the Node.js Script

```bash
cd Backend/revogue-backend
npm run update-images
```

Make sure your `.env` file has the correct database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=revogue
```

## Verify Images Are Updated

After running any of the above methods, refresh your store page. The product images should now appear!

