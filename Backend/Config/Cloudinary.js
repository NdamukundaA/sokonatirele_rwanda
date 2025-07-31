const { v2: cloudinary } = require('cloudinary');
const dotenv = require('dotenv');

dotenv.config();

const connectCloudinary = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error('Missing Cloudinary configuration in environment variables');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log('Cloudinary configured successfully');
  return cloudinary;
};

module.exports = connectCloudinary;
