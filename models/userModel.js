const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Product = require('./productModel')
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter userName']
        },
    email:{
            type:String,
            unique:true,
            required:[true,"Please provide emanil"],
            validate:[validator.isEmail , 'Please Provide a valid Email']

        },
    password:{
            type:String,
            min:8,
            max:12,
            required:[true,"Please enter password"]
        },
    confirmPassword:{
            type:String,
    
            validate:{
                validator: function(val){
                    return val === this.password
                },
                message:'Passwords are not same'
            }
        },
    role:{
            type:String,
            default:'user',
            enum:['user','admin']
        },
    address:{
        name:{ type:String },
        contact:{ type:String},
        address:{ type:String},
        cityName:{ type:String},
        provinceName:{ type:String},

    },
    orderedProducts:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'Product'

        }
    ],
        passwordResetToken: String,
        passwordResetExpires: Date

    });
    userSchema.pre('save', async function(next){
        if(!this.isModified('password')) next();
        this.password = await bcrypt.hash(this.password,12);
        this.confirmPassword = undefined;
        next();
    });

    userSchema.methods.correctPassword = async function(candidatePassword , userPassword){
        return await bcrypt.compare(candidatePassword,userPassword);
    }
    userSchema.methods.createPasswordResetToken = async function(){
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = resetToken;
        this.passwordResetExpires= Date.now()+ 10*60*1000;
        return resetToken;
    }
    
    const User = mongoose.model('User',userSchema);

    module.exports = User;
     