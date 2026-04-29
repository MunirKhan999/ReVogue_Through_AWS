const { Client } = require('pg');

// Load environment variables if dotenv is available
try {
  require('dotenv').config({ path: '.env' });
} catch (e) {
  // dotenv not installed, use environment variables directly
}

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'revogue',
});

const productImages = {
  'Classic White Tee': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=80',
  'Wool Beanie': 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop&q=80',
  'Leather Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop&q=80',
  'Slim Fit Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop&q=80',
  'Summer Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop&q=80',
};

async function updateProductImages() {
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Database: ${process.env.DB_NAME || 'revogue'}`);
    
    await client.connect();
    console.log('✓ Connected to database\n');

    for (const [productName, imageUrl] of Object.entries(productImages)) {
      // First, try to update products without images
      const result = await client.query(
        `UPDATE products 
         SET image_url = $1 
         WHERE name = $2 AND (image_url IS NULL OR image_url = '')`,
        [imageUrl, productName]
      );
      
      if (result.rowCount > 0) {
        console.log(`✓ Updated image for: ${productName}`);
      } else {
        // Try updating even if image_url exists (force update)
        const updateResult = await client.query(
          `UPDATE products SET image_url = $1 WHERE name = $2`,
          [imageUrl, productName]
        );
        if (updateResult.rowCount > 0) {
          console.log(`✓ Updated image for: ${productName} (overwrote existing)`);
        } else {
          console.log(`⚠ No product found with name: ${productName}`);
        }
      }
    }

    // Verify updates
    console.log('\nVerifying updates...');
    const verifyResult = await client.query(
      'SELECT name, image_url FROM products WHERE name = ANY($1)',
      [Object.keys(productImages)]
    );
    
    console.log('\nCurrent product images:');
    verifyResult.rows.forEach(row => {
      if (row.image_url) {
        console.log(`  ✓ ${row.name}: ${row.image_url.substring(0, 50)}...`);
      } else {
        console.log(`  ✗ ${row.name}: No image`);
      }
    });

    console.log('\n✅ Product image update complete!');
  } catch (error) {
    console.error('\n❌ Error updating product images:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running and the connection details are correct.');
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

updateProductImages();

