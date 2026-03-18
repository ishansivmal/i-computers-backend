import dotenv from 'dotenv';
dotenv.config();  // ✅ MUST BE FIRST!

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import chartbotRouter from './routers/chartbotRouter.js';
import { initGroq  } from './controllers/chartbotController.js';
// ✅ Get environment variables
const mongoURL = process.env.mongoURL;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// Validate required variables
if (!mongoURL) {
    console.error("❌ ERROR: mongoURL not found in .env file");
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error("❌ ERROR: JWT_SECRET not found in .env file");
    process.exit(1);
}

// ✅ Initialize Groq after dotenv loads
try {
    initGroq();
} catch (error) {
    console.error("❌ ERROR: Could not initialize Groq:", error.message);
    process.exit(1);
}

// ✅ MongoDB connection with error handling
mongoose.connect(mongoURL)
    .then(() => {
        console.log("✅ Connected to MongoDB");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    });

const app = express();

// ✅ CORS configuration
app.use(cors({
    origin: 'https://i-computers-frontend-eta.vercel.app',
    credentials: true
}));

app.use(express.json());

// ✅ Authentication middleware with JWT_SECRET from .env
app.use((req, res, next) => {
    const authHeader = req.header("Authorization");
    
    if (authHeader) {
        const token = authHeader.replace("Bearer ", "");

        jwt.verify(token, JWT_SECRET, (error, content) => {
            if (error || content == null) {
                console.log("❌ Invalid token");
                return res.status(401).json({
                    message: "Invalid token"
                });
            } else {
                console.log("✅ Authenticated user:", content);
                req.user = content;
                next();
            }
        });
    } else {
        console.log("ℹ️ No token - unauthenticated user");
        next();
    }
});

app.get('/', (req, res) => {
    res.json({
        message: "i-computers backend is running",
        status: "OK"
    });
});

app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/chat', chartbotRouter);

// ✅ 404 error handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// ✅ Start server with correct port
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});