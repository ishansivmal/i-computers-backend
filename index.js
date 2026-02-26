    import express from 'express';
    import cors from 'cors';
    import mongoose from 'mongoose';

    import userRouter from './routers/userRouter.js';
    import productRouter from './routers/productRouter.js';
    import jwt from 'jsonwebtoken';  // Fixed: was 'jwl', should be 'jwt'
    import dotenv from 'dotenv';
    import orderRouter from './routers/orderRouter.js';
    dotenv.config();

    const mongoURL = process.env.mongoURL
    mongoose.connect(mongoURL).then(() => {
        console.log("connected to mongoDB");
    })

    const app = express();
    //available frontend req come to back end using cors
    const allowedOrigins = [
        'https://i-computers-frontend-eta.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ];
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }));
    app.use(express.json());

    //make security room of us it a middleware
    app.use((req, res, next) => {
        const AuthorizationHeader = req.header("Authorization");
        
        if (AuthorizationHeader != null) {
            //remove Bearer from token
            const token = AuthorizationHeader.replace("Bearer ", "");

            // we start to decrypt the token
            jwt.verify(token, "secretkey96#2025", (error, content) => {
                if (error || content == null) {
                    console.log("No user found - not authenticated");
                    // CRITICAL FIX: Added return here
                    return res.status(401).json({
                        message: "Invalid token"
                    });
                } else {
                    console.log("authenticated user", content);
                    req.user = content;
                    next();
                }
            });
        } else {
            // If no token, continue without authentication
            console.log("No user found - not authenticated");
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


    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });