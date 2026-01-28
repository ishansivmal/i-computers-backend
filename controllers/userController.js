import e from "express";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

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
        console.log("User role:", req.user.role)
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