
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utilits/catchAsync');

const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expireIn:process.env.JWT_EXPIRES_IN
    })
}
const creatSendToken =(res,user,status) =>{
    const token = signToken(user._id)

    const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
    };
   

    res.cookie('jwt',token, cookieOptions);
    res.status(status).json({
        status:'success',
        token,
        data:{
            data:user
        }
    })
}

exports.signup = catchAsync(async(req,res,next)=>{
    
    const user = await User.create(req.body);

    creatSendToken(res,user,201);
  
});