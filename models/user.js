import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {

        email :{
            type:String,
            required:true,
            unique:true
        },

        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },

        type:{
            type:String,
            
            default:'customer'
        },

        isBloked:{
            type:Boolean,
            default:false
        },

        isEmailVerified:{
            type:Boolean,
            default:false
        },
        role:{
            type: String,
            default : "customer"
        },

        image:{
            type:String,
           
            default :'/default.png'

        
        
    }
}
)

const User = mongoose.model('User',userSchema); // model creation
export default User; 