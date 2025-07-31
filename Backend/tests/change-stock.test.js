const axios = require('axios');

const API_URL = 'http://localhost:9090/api';
const ADMIN_TOKEN = 'your-admin-token-here'; // Replace with your actual admin token

async function changeProductStock() {
  try {
    // Replace 'product-id-here' with the actual product ID you want to update
    const productId = 'product-id-here';
    
    const response = await axios.put(
      `${API_URL}/product/changeStock/${productId}`,
      { inStock: false }, // Set to false for out of stock
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      }
    );

    console.log('Stock status updated successfully:', response.data);
  } catch (error) {
    console.error('Error updating stock status:', error.response?.data || error.message);
  }
}

// Run the test
changeProductStock(); 