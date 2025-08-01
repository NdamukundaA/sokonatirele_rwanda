Soko Natirele Rwanda – E-Commerce Platform
This project includes multiple services for an online marketplace: Admin Frontend, Seller Frontend, Customer Frontend, and Backend Server.

Project Structure
bash
Copy
Edit
├── AdminFrontend/      # Admin dashboard
├── Backend/            # API server (Node.js & Express)
├── customerFrontend/   # Customer-facing frontend (React + Vite)
└── SellerFrontend/     # Seller dashboard (React + Vite)
Prerequisites
Node.js (Latest LTS version recommended)

MongoDB (local or cloud, like MongoDB Atlas)

Git

Clone the Repository
bash
Copy
Edit
git clone https://github.com/NdamukundaA/sokonatirele_rwanda.git
cd sokonatirele_rwanda
Backend Setup
Navigate to the backend directory:

bash
Copy
Edit
cd Backend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file:

bash
Copy
Edit
cp .env.example .env
Fill in the environment variables in .env:

ini
Copy
Edit
DBCONNECTION=your_mongodb_url
PORT=5000
SECRETKEY=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FLW_PUBLIC_KEY=your_flutterwave_public_key
FLW_SECRET_KEY=your_flutterwave_secret_key
FLW_ENCRYPTION_KEY=your_flutterwave_encryption_key
Run the seed file to create default admin credentials:

bash
Copy
Edit
node seeds.js
Start the backend server:

bash
Copy
Edit
npm start
Customer Frontend Setup
Go to the customer frontend folder:

bash
Copy
Edit
cd customerFrontend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file:

bash
Copy
Edit
cp .env.example .env
Start the development server:

bash
Copy
Edit
npm run dev
Seller Frontend Setup
Go to the seller frontend folder:

bash
Copy
Edit
cd SellerFrontend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file:

bash
Copy
Edit
cp .env.example .env
Start the development server:

bash
Copy
Edit
npm run dev
Admin Frontend Setup
Go to the admin frontend folder:

bash
Copy
Edit
cd AdminFrontend
Install dependencies:

bash
Copy
Edit
npm install
Create a .env file:

bash
Copy
Edit
cp .env.example .env
Start the development server:

bash
Copy
Edit
npm run dev
Production Build
For any frontend application, create a production build using:

bash
Copy
Edit
npm run build
Environment Variables (Backend)
DBCONNECTION: MongoDB connection string

PORT: Port number (default: 5000)

SECRETKEY: JWT secret key

Cloudinary:

CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET

Flutterwave:

FLW_PUBLIC_KEY

FLW_SECRET_KEY

FLW_ENCRYPTION_KEY

Default Ports
Service	Port
Backend API	3000
Customer Frontend	5173
Seller Frontend	5174
Admin Frontend	5175