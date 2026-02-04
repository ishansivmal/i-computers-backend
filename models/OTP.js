import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
    email: { type: String,
         required: true ,
            unique: true 
        },

    otp: { 
        type: String,
            required: true


     } // OTP expires in 5 minutes
});

const OTP = mongoose.model("OTP", OTPSchema);
export default OTP;