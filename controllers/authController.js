
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utilits/catchAsync');
const AppError = require('./../utilits/appError');
const sendEmail = require('./../utilits/email');
const passport = require('passport');
const {promisify} = require('util');

const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}
const createSendToken =(res,user,status) =>{
    const token = signToken(user._id)

    const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
      };
      if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
   

  
    res.status(status).json({
        status:'success',
        jwt:token,
        data:{
            user
        }
    })
}

exports.protect = catchAsync(async(req,res,next)=>{ // protect() middleware function for protecting routes by giving access to route for loggedIn users only
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ){
        token = req.headers.authorization.split(' ')[1];
      } 
      console.log(token);
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);// catchAsync will auto send err to global error handler if accurs like expired or invalid JWT errrs
    
    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
    return next(new AppError('The user of token not longer exist',401))
    }
    // if(currentUser.changePasswordAfter(decoded.iat)){
    //     return next(new AppError('The user of token not longer exist',401))
    // }
    req.user = currentUser; // must place current user in req.user so routes after that middleware can acces to currently loggedin user by req.user 
    next();// must place next() at the end bcz this is a middleare so the next comming route or middleware can run
});

exports.signup = catchAsync(async(req,res,next)=>{
    
    const user = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        role:req.body.role
    });
    
    createSendToken(res,user,201);
  
});

exports.signin = catchAsync(async(req,res,next)=>{
    
    const {password,email} = req.body;
    if(!password || !email){
        return next(new AppError('Please provide password and email ', 400))
    }
    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password , user.password)) ){
        return next(new AppError('Incorrect Password or Email', 401))
        
    }
    createSendToken(res,user,200);
});

exports.forgetPassword = catchAsync(async(req,res,next)=>{
    const{email}= req.body;
    if(!email)return next(new AppError('Please enter email',400))
    const user = await User.findOne({email:email});
    if(!user) return next(new AppError(`THere is no user with ${email} email`, 401));

    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforSave : false});// preventing every kind of validation and mongoose middleware to run for this doc save().
    
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
    const message=`Forget your Password?. If yes! Submit PATCH request with the new password and password confirm to :${resetURL}. \n
    If you did not forget passwordignore this mail`;
  
    try{
        await sendEmail ({
            email :user.email,
            subject:'Your password reset token "only valid for 10 minutes"',
            message :message
        });
        res.status(200).json({
            status:'success',
            message:'token send to given email'
        })
    }catch (err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined ;
        await user.save({validateBeforSave:true});
        return next(new AppError('There was an error while sending email. Try again later' , 500))
    }
});
exports.signout = catchAsync(async(req,res,next)=>{
    
    
    try{
        
        console.log('successfully loged out')
        res.status(200).json({
            status:'success',
            message:'successfully loged oput'
        })
    }catch(err){
    console.log(err)
    }
   
})

