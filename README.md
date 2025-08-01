🛒 Soko Natirele Rwanda – E-Commerce Platform
A full-stack e-commerce platform with separate interfaces for Admins, Sellers, and Customers.

📁 Project Structure
bash
Copy
Edit
├── AdminFrontend/      # Admin dashboard interface
├── Backend/            # Express.js backend API server
├── customerFrontend/   # Customer-facing frontend (Vite + React)
└── SellerFrontend/     # Seller dashboard (Vite + React)
🛠️ Prerequisites
Ensure you have the following installed:

Node.js (Latest LTS version recommended)

MongoDB (Running locally or cloud-hosted like MongoDB Atlas)

Git

🚀 Clone the Repository
bash
Copy
Edit
git clone https://github.com/NdamukundaA/sokonatirele_rwanda.git
cd sokonatirele_rwanda
🔧 Backend Setup
Navigate to the backend folder:

bash
Copy
Edit
cd Backend
Install dependencies:

bash
Copy
Edit
npm install
Create the environment configuration:

bash
Copy
Edit
cp .env.example .env
Fill in .env with your environment variables:

ini
Copy
Edit
DBCONNECTION=<your_mongodb_url>
PORT=3000
SECRETKEY=<your_jwt_secret>
CLOUDINARY_CLOUD_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>
FLW_PUBLIC_KEY=<flutterwave_public_key>
FLW_SECRET_KEY=<flutterwave_secret_key>
FLW_ENCRYPTION_KEY=<flutterwave_encryption_key>
Seed the database with the default admin:

bash
Copy
Edit
node seeds.js
Start the backend server:

bash
Copy
Edit
npm start
🌐 Customer Frontend Setup
Go to the customer frontend directory:

bash
Copy
Edit
cd customerFrontend
Install dependencies:

bash
Copy
Edit
npm install
Create .env file:

bash
Copy
Edit
cp .env.example .env
Start the development server:

bash
Copy
Edit
npm run dev
🛍️ Seller Frontend Setup
Navigate to the seller frontend:

bash
Copy
Edit
cd SellerFrontend
Install dependencies:

bash
Copy
Edit
npm install
Create .env:

bash
Copy
Edit
cp .env.example .env
Start the development server:

bash
Copy
Edit
npm run dev
🧑‍💼 Admin Frontend Setup
Navigate to the admin frontend:

bash
Copy
Edit
cd AdminFrontend
Install dependencies:

bash
Copy
Edit
npm install
Create .env:

bash
Copy
Edit
cp .env.example .env
Start the development server:

bash
Copy
Edit
npm run dev
🏗️ Production Build
To build any frontend app for production:

bash
Copy
Edit
npm run build
This will generate a dist/ folder with optimized static files.

🌍 Default Ports
Component	Port
Backend API	3000
Customer Frontend	5173
Seller Frontend	5174
Admin Frontend	5175
