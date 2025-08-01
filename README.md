# Soko Natirele Rwanda E-Commerce Platform

This project consists of multiple services: Admin Frontend, Seller Frontend, Customer Frontend, and Backend Server.

## Project Structure
```
├── AdminFrontend/     # Admin dashboard application
├── Backend/           # Main API server
├── customerFrontend/  # Customer-facing web application  
└── SellerFrontend/    # Seller dashboard application
```

## Prerequisites
- Node.js (Latest LTS version)
- MongoDB installed and running
- Git

##  clone  github  repo
https://github.com/NdamukundaA/sokonatirele_rwanda.git

## Backend Setup

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file from example:
```bash
cp .env.example .env
```

4. Configure your .env file with required values:
- DBCONNECTION=your_mongodb_url
- PORT=3000
- SECRETKEY=your_secret_key
- CLOUDINARY credentials
- FLUTTERWAVE credentials

5. run  seeds  file  for  saving  admin  credencials:
```bash
  node  seeds.js
```

6. Start the server:
```bash
npm start
```

## Customer Frontend Setup

1. Navigate to customerFrontend directory:
```bash
cd customerFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Seller Frontend Setup

1. Navigate to SellerFrontend directory:
```bash
cd SellerFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Admin Frontend Setup

1. Navigate to AdminFrontend directory:
```bash
cd AdminFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Production Build

For each frontend application, you can create production builds using:
```bash
npm run build
```

## Environment Variables

### Backend
- DBCONNECTION: MongoDB connection string
- PORT: Server port (default: 5000)
- SECRETKEY: JWT secret key
- CLOUDINARY_CLOUD_NAME: Cloudinary cloud name
- CLOUDINARY_API_KEY: Cloudinary API key
- CLOUDINARY_API_SECRET: Cloudinary API secret
- FLW_PUBLIC_KEY: Flutterwave public key
- FLW_SECRET_KEY: Flutterwave secret key
- FLW_ENCRYPTION_KEY: Flutterwave encryption key


## Default Ports
- Backend: 3000
- Customer Frontend: 5173
- Seller Frontend: 5174
- Admin Frontend: 5175
