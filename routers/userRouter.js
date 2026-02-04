
import express from 'express';
 import { createUser, loginUser,getUsers } from '../controllers/userController.js';
import { googlelogin } from '../controllers/userController.js';
import { sendOTP,validateOTP_and_updatePassword } from '../controllers/userController.js';

const  userRouter  =  express.Router();

userRouter.post("/create",createUser),
userRouter.post("/login",loginUser),
userRouter.get("/",getUsers)
userRouter.post("/googlelogin",googlelogin);
userRouter.get("/sendOTP/:email", sendOTP);
userRouter.post("/validateOTP", validateOTP_and_updatePassword);
export default  userRouter 
  