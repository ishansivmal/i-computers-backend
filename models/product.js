import mongoose from "mongoose";


const productSchema = new mongoose.Schema(
    {

        productID :{
            type: String,
            required: true,
            unique: true,

        },

        pName :{
            type :String,
            required: true,

        },
        pAltname: {
            //string array
            type: [String],
            default: []
        },
        pDescription: {
            type: String,
            required: true
        },

        price :{
            type: Number,
            required: true
        },
        lebalPrice :{
            type : Number,
            required: true
        },

        images :{

            type: [String],
            required: true
        },

        category: {
            type: String,
            required: true
        },
        Brand : {
            type: String,
            required: true,
            default: "Genaric"

        },
        Model: {
            type: String,
            required: true,
            default: "standard"
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        isAvalabale : {
            type : Boolean,
            default: true 
        }

    }
    )
    const product = mongoose.model("Product", productSchema);
    export default product;
