# Auction Platform

A modern online auction platform built with React, TypeScript, Node.js, Express, and MongoDB. The platform allows users to buy and sell items through an auction system.

## Project Structure

```
Auction-Platform/
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components
│   ├── contexts/           # React context providers
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   └── config/             # Configuration files
├── server/                 # Backend Express application
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── config/         # Server configuration
│   └── package.json        # Backend dependencies
├── public/                 # Static files
└── package.json            # Frontend dependencies
```

## Features

- User authentication with JWT
- Create and manage auctions
- Place bids on items
- Real-time bid updates
- User profiles and dashboard
- Secure payment processing
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/iAmTheBest4222/Auction-Platform.git
cd Auction-Platform
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

4. Create environment variables:
   - Create `.env` file in the root directory for frontend
   - Create `.env` file in the `server` directory for backend

5. Start the development servers:
   - Frontend (from root directory):
   ```bash
   npm start
   ```
   - Backend (from server directory):
   ```bash
   npm run dev
   ```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001
```

### Backend (server/.env)
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/auction-platform
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## Available Scripts

### Frontend
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linter

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

## API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Items
- GET `/api/items` - Get all items
- POST `/api/items` - Create new item
- GET `/api/items/:id` - Get item by ID
- PUT `/api/items/:id` - Update item
- DELETE `/api/items/:id` - Delete item

### Bids
- POST `/api/bids/:itemId` - Place a bid
- GET `/api/bids/:itemId` - Get bids for an item

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - keshumishra987@gmail.com
Project Link: https://github.com/iAmTheBest4222/Auction-Platform
