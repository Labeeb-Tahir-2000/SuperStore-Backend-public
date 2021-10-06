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
            min:4,
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
        passwordResetExpires: Date,
        passwordChangedAt: Date

    });
    // run on every save() function 
    userSchema.pre('save', async function(next){
        if(!this.isModified('password')) next();//must do it bcz user may modified password or requsted for password so make him unable to login
        this.password = await bcrypt.hash(this.password,12);
        this.confirmPassword = undefined;
        next();
    });

    userSchema.pre('save', function(next) {
        if (!this.isModified('password') || this.isNew) return next();
      
        this.passwordChangedAt = Date.now() - 1000;// will set that field to 1 second late of current time bcz it may run befre its new JWT created with current time
        next();
      });

      // this method will check either user change password after its JWT was created i yes not allow to log him with that jwt, used in protect middleware
    userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
        if (this.passwordChangedAt) { // this fiels have time of password was changed if it is changed
          const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
          );
      
          return JWTTimestamp < changedTimestamp;// will send true or false acoording to < ccondition to where this function is called
        }
      
        // False means NOT changed
        return false;
    };

    userSchema.methods.correctPassword = async function(candidatePassword , userPassword){
        return await bcrypt.compare(candidatePassword,userPassword);
    }
    userSchema.methods.createPasswordResetToken = async function(){
        const resetToken = crypto.randomBytes(32).toString('hex');
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.passwordResetExpires= Date.now()+ 10*60*1000;
        
        return resetToken;
    }
    
    const User = mongoose.model('User',userSchema);

    module.exports = User;
     