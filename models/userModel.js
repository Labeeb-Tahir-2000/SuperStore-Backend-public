const mongoose = require('mongoose');
const validator = require('validator');

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
            enum:['user','role']
        }

    });

    const User = mongoose.model('User',userSchema);

    module.exports = User;
     