import e from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/OTP.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user:"sivmalishan@gmail.com",
        pass:process.env.Gmail_app_password
    }
});

export function createUser(req,res){

    const data = req.body

    const hashPassword =  bcrypt.hashSync(data.password,10)
    
    const user = new User({
        email : data.email,
        password : hashPassword,
        lastName : data.lastName,
        firstName : data.firstName
    });

    user.save().then(
        res.json({
            message:hashPassword+" User created successfully"
        })
    ) 

   
    

}

export function loginUser(req,res){
    const email = req.body.email;
    const password = req.body.password;     

    User.find({email:email}).then(
        (users)=>{

            if(users[0]==null)
            {
                res.json({
                    message : "user not found"
                })
            }
            else{
                const user = users[0];
                const isPasswordValid = bcrypt.compareSync(password,user.password);
                if(isPasswordValid){


                    const payload = { 
                        email: user.email,
                        lastName: user.lastName,
                        firstName: user.firstName,
                        role : user.role,
                        isEmailVerified : user.isEmailVerified,
                        image : user.image
                    };
                    const token = jwt.sign(payload,process.env.jwtSecret,{expiresIn :'150h'})

                    res.json({
                        message : "login successful",
                        token:token,
                        role: user.role
                    })
                }
                else{
                    res.status(401).json({
                        message : "invalid password"
                    })
                }
            }
        }
           

       
        
        
    )

   

}


// ✅ CORRECT VERSION
export function isAdmin(req){
    // If no user, they are NOT admin
    if(req.user == null){
        console.log("No user found - not authenticated")
        return false  // ✅ Return FALSE when user is null
    }

    // If user exists but is not admin
    if(req.user.role != "admin"){
        
        return false
    }
    
    // User exists and is admin
    return true
}
//add try catch blocks



export  function getUsers(req,res){
   if(req.user ==null)
   {
    res.status(401).json
    ({message:"Unauthorized"})
    return
   }

   res.json(req.user)

}

export async function googlelogin(req, res) {
    
    console.log("Token received:", req.body.token);
   
    try
        {

            const response = await axios.get(
                "https://oauth2.googleapis.com/tokeninfo",
            {
                headers: {
                    Authorization: `Bearer ${req.body.token}`,
                }
            }
            );

            console.log("Google token verification response:", response.data);

            const user = await User.findOne({ email: response.data.email });

            if(user==null)
            {
                const newUser = new User({
                    email : response.data.email,
                    lastName : response.data.family_name,
                    firstName : response.data.given_name,
                    password : "123",
                    image : response.data.picture   
                    
                })
                await newUser.save();

                const payload = {
                    email: newUser.email,
                    lastName: newUser.lastName,
                    firstName: newUser.firstName,
                    role: newUser.role,
                    isEmailVerified:true,
                    image: newUser.image

                }
                const token = jwt.sign(payload, process.env.jwtSecret, { expiresIn: '150h' })
                res.json({
                    message: "login successful",
                    token: token,
                    role: newUser.role
                });

            }
            else
            {
                const payload = {
                    email: user.email,
                    lastName: user.lastName,
                    firstName: user.firstName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image
                }
                const token = jwt.sign(payload, process.env.jwtSecret, { expiresIn: '150h' })
                res.json({
                    message: "login successful",
                    token: token,
                    role: user.role
                });

            }
            


        } catch (error) {
            console.error("Error verifying Google token:", error);
        }   

    
}

//reset passsword part under

export async function sendOTP(req,res)

{
    try{

    const email = req.params.email;


    const user = await User.findOne({email:email});

    if(user==null)
    {
        res.status(404).json({message:"User not found"});
        return;
    }


    await OTP.deleteMany({email:email});

    //generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    await new OTP({otp: otpCode, email: email}).save();

    




    const message = {

        from: "sivmalishan@gmail.com",
        to: email,
        subject: "Password Reset OTP",
        text: "Your OTP code is " + otpCode
    }

    transporter.sendMail(message,function(err,info){
        if(err)
        {
            console.log(err);
            res.status(500).json({message:"Failed to send OTP email"});
        }
        else
        {
            console.log("Email sent: "+info.response);
            res.json({message:"OTP email sent successfully"});
        }

     
} 

    )}    catch(error){
        console.log(error);
        res.status(500).json({message:error.message});
    }

}


export async function validateOTP_and_updatePassword(req,res)

{
    try{
    const otp = req.body.otp;
    const email = req.body.email;
    const newPassword = req.body.newPassword;

    const otpRecord = await OTP.findOne({email:email, otp:otp});

    if(otpRecord==null)
    {
        res.status(400).json({message:"Invalid OTP"});
        return;
    }

    await OTP.deleteMany({email:email});

    const hashedPassword = bcrypt.hashSync(newPassword,10);

    await User.updateOne({email:email}, {$set: {password: hashedPassword, isEmailVerified:true}});
    res.json({message:"Password updated successfully"});

    } catch(error){
        console.log(error);
        res.status(500).json({message:error.message});
    }
}