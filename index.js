import express from 'express';
import mongoose from 'mongoose';

import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import jwl from 'jsonwebtoken';

const mango = "mongodb+srv://ishan:1234@cluster0.xnsttfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(mango).then
(()=>{
    console.log("connected to mongoDB");
})


const app = express();
app.use(express.json());

//make securty room of us it amiddleware
app.use((req,res,next)=>{

    const AuthorizationHeader = req.header("Authorization")
    if(AuthorizationHeader != null)
    {
        //remove Bearer from token
        const token = AuthorizationHeader.replace("Bearer ","");
       
        // we start to decrypt the token
        jwl.verify(token,"secretkey96#2025",
            (error,content)=>{
                if(content==null)
                {
                   
                    res.json({

                        message : "invalid token"
                        
                    })
                    // if wrong token we dont run until after that  why use return
                    
                }
                else
                {
                   
                    req.user = content
                     next();
                }
            })
    }
    // if they dont have token  if they go as login
    else{
        next()
    }
    

    // next is a funtion id give detils to people who need it,like hand over job
 

}
)


app.use('/users',userRouter)
app.use('/products',productRouter);


app.listen(5000,()=>{
    console.log("server is running on port 5000")
  }) ;












