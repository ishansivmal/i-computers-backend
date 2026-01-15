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


export function isAdmin(req){

     if(req.user == null){
        console.log(req.user);
        return false
    }

    if(req.user.role != "admin"){
        console.log(req.user);
        return false
    }
    return true


}
//add try catch blocks