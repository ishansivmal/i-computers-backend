// index.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
const mongoURL = process.env.mongoURL;
mongoose.connect(mongoURL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

const app = express();

// CORS setup
const allowedOrigins = [
    'http://localhost:5173', // React dev frontend
    'https://your-production-frontend.com' // Replace with your deployed frontend URL
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin like Postman or mobile apps
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true // Needed if using cookies or auth headers
}));

app.use(express.json());

// JWT authentication middleware
app.use((req, res, next) => {
    const AuthorizationHeader = req.header("Authorization");
    if (AuthorizationHeader != null) {
        const token = AuthorizationHeader.replace("Bearer ", "");
        jwt.verify(token, "secretkey96#2025", (error, content) => {
            if (error || content == null) {
                console.log("No user found - not authenticated");
                return res.status(401).json({ message: "Invalid token" });
            } else {
                console.log("Authenticated user:", content);
                req.user = content;
                next();
            }
        });
    } else {
        console.log("No user found - not authenticated");
        next();
    }
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: "i-computers backend is running", status: "OK" });
});

// Routers
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));