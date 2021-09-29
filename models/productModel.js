const mongoose = require('mongoose');
const validator = require('validator');


const productSchema = new mongoose.Schema({
    pTitle:{
        type:String,
        required:[true,'Please enter userName']
        },
    pEdible:{
            type:String,

        },
    pDescription:{
            type:String,
            required:[true,"Please provide Product type"],
        },
    pPrice:{
            type:Number,
            required:[true,"Please enter price"]
        },
    pOldPrice:{
        type:Number,
    },
    pCetegory:{
            type:String,
            required:[true,"Please select cetegory"]       
        },
    pImagePath:{
            type:String,
            required:[true,"Please Upload image"]    
        },
    pStock:{
        type:Number,
        required:[true,"Please enter number of units"]
    },
    pOnSale:{
        type:String,
    }
    });
    
    const Product = mongoose.model('Product',productSchema);
    module.exports = Product;