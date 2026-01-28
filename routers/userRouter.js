
import express from 'express';
 import { createUser, loginUser,getUsers } from '../controllers/userController.js';



const  userRouter  =  express.Router();

userRouter.post("/create",createUser),
userRouter.post("/login",loginUser),
userRouter.get("/",getUsers)

export default  userRouter 
 