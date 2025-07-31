const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:9090/api'; // Updated to correct port 9090
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with your actual admin token

// Sample categories data with image paths
const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    imagePath: './test-images/electronics.jpg'
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel items',
    imagePath: './test-images/clothing.jpg'
  },
  {
    name: 'Books',
    description: 'Books and publications',
    imagePath: './test-images/books.jpg'
  }
];

async function testCategories() {
  try {
    // Test adding categories
    console.log('Testing category creation...');
    
    for (const category of categories) {
      const formData = new FormData();
      formData.append('categoryData', JSON.stringify({
        name: category.name,
        description: category.description
      }));
      
      // Add image if it exists
      try {
        if (fs.existsSync(category.imagePath)) {
          formData.append('image', fs.createReadStream(category.imagePath));
          console.log(`Adding image for ${category.name}`);
        } else {
          console.log(`No image found for ${category.name}, proceeding without image`);
        }
      } catch (err) {
        console.log(`Error reading image for ${category.name}:`, err.message);
      }
      
      const response = await axios.post(`${API_URL}/categories`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      console.log(`Created category: ${category.name}`, response.data);
    }

    // Test getting all categories
    console.log('\nTesting get all categories...');
    const allCategories = await axios.get(`${API_URL}/categories`);
    console.log('All categories:', allCategories.data);

  } catch (error) {
    console.error('Error testing categories:', error.response?.data || error.message);
  }
}

// Run the tests
testCategories(); 