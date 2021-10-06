
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('../utilits/catchAsync');
const AppError = require('./../utilits/appError');
const sendEmail = require('./../utilits/email');
const crypto = require('crypto');
const passport = require('passport');
const {promisify} = require('util');
const nodemailer = require('nodemailer')
const nodemailMailgun = require('nodemailer-mailgun-transport');
const { syncBuiltinESMExports } = require('module');

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
     //  Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
    
    req.user = currentUser; // must place current user in req.user so routes after that middleware can acces to currently loggedin user by req.user 
    next();// must place next() at the end bcz this is a middleare so the next comming route or middleware can run
});

exports.signup = catchAsync(async(req,res,next)=>{
    
    const user = await User.create({
        name : req.body.name,
        email : req.body.email,
        password : req.body.password,
        confirmPassword : req.body.confirmPassword,
        
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
    if(!email)return next(new AppError('Please enter email Address',400))
    const user = await User.findOne({email:email});
    if(!user) return next(new AppError(`There is no user with ${email} email.. Please provide valid Email Addrees`, 401));

    const resetToken =await  user.createPasswordResetToken();
    await user.save({validateBeforSave : false});// preventing every kind of validation and mongoose middleware to run for this doc save().
    
    const resetURL = ` http://localhost:3001/ChangePassword/${resetToken}`;
    const message=`Forget your Password? If yes! Then click on the given Link and set up your new password: ${resetURL}. \n
    If you did not forget password, Please ignore this Email`;

    try{
        const auth={
            auth:{
                api_key:process.env.MAILGUN_API_KEY,
                domain:process.env.MAILGUN_DOMAIN
            }
        }
        let transporter= nodemailer.createTransport(nodemailMailgun(auth));
        const mailOptions={
            from:'onlinegrocerymart.store@gmail.com',
            to:user.email,
            subject:'Your password reset token "only valid for 10 minutes"',
            text :message
            
        }
       transporter.sendMail(mailOptions , async(err ,data)=>{
                if(err){
                    console.log(err)
                    user.passwordResetToken = undefined;
                    user.passwordResetExpires = undefined ;
                    await user.save({validateBeforSave:true});
                    return next(new AppError('There was an error while sending email. Try again later' , 500))
                }else{
                    console.log(data)
                    res.status(200).json({
                        status:'success',
                        message:'password reset instructions send to given email, Please go and check Email on urgent basis!'
                    }) 
                }         
                
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

exports.setAddress = catchAsync(async(req,res,next)=>{
    let Address = {
        name :req.body.name,
        contact :req.body.contact,
        address:req.body.address,
        cityName :req.body.cityName,
        provinceName :req.body.provinceName,
    };

    if(!Address){
        return new AppError('please fill address books',400)
    }
    console.log(Address )
    const user = await User.findByIdAndUpdate(req.user, {address:Address} ,  {useFindAndModify: false });
    if(!user){
        return new AppError('cannot add user address',500)
    }
    res.status(201).json({
        status:'success',
        user
    })
});

exports.getUser = catchAsync(async(req,res,next)=>{
   
  
    const user = await User.findById(req.user).populate({
        path:'orderedProducts',
        select:'-__v -password -confirmPassword  -passwordResetToken -passwordResetExpires'
});
    if(!user){
        return new AppError('user didnot exist anymore',500)
    }
    res.status(201).json({
        status:'success',
        user
    })
})

exports.setUserOrder = catchAsync(async(req,res,next)=>{
    let previousTotal =req.body.previousTotal;
    let subTotal = req.body.subTotal;
    let shippingFee= req.body.shippingFee;
    let productIDs= [...req.body.products];
    let to= `lat712000 , ${req.user.email}`;
    console.log(to)
 console.log(req.body)
     const userData = await User.findById(req.user)
     
     const userOlderOrders = [...userData.orderedProducts]
     
    
     for(let i= 0 ; i < userOlderOrders.length ; i++){
         productIDs.push(userOlderOrders[i]);
     
     }
     console.log(productIDs)
     const user = await User.findByIdAndUpdate(req.user, {orderedProducts: productIDs} ,  {useFindAndModify: false });
     if(!user){
         return new AppError('user didnot exist anymore',500)
     }else{
       try{
         const auth={
             auth:{
                 api_key:process.env.MAILGUN_API_KEY,
                 domain:process.env.MAILGUN_DOMAIN
             }
         }
         let transporter=  nodemailer.createTransport(nodemailMailgun(auth));
         const mailOptions1={//mail to admin
             from:'onlinegrocerymart.store@gmail.com',
             to:'lat712000@gmail.com' ,
             subject:'New Order',
             text :`Customer Name: ${user.name}   Id: ${user._id}
                   Order Details:
                   1) Previouse  non-Delivered Order with '${userOlderOrders.length}' items: Rs. ${previousTotal}.
                   2) New  Order with '${req.body.products.length}' items: Rs. ${subTotal}.
                   3) Shipping Charges: Rs. ${shippingFee}
                   -----------------------------------------------------------------------------
                      Total: Rs. ${subTotal+shippingFee+previousTotal}
                   -----------------------------------------------------------------------------`
             
         }
         console.log(user.email)
         const mailOptions2={// mail to customer
            from:'onlinegrocerymart.store@gmail.com',
            to:user.email,
            subject:'Order Details',
            text :`Thanks for Shopping at wwww.onlinegrocerymart.store

                   Order Details:
                   Customer Name: ${user.name}.
                   1) Previouse  non-Delivered Order with '${userOlderOrders.length}' items: Rs. ${previousTotal}.
                   2) New  Order with '${req.body.products.length}' items: Rs. ${subTotal}.
                   3) Shipping Charges: Rs. ${shippingFee}
                   -----------------------------------------------------------------------------
                      Total: Rs. ${subTotal+shippingFee+previousTotal}
                   -----------------------------------------------------------------------------`
            
        }
        transporter.sendMail(mailOptions1,(err,data)=>{
           if(err){ 
               return res.status(201).json({
                 status:'success',
                 user
             })
           }else{
               console.log(data)
           }
       })
       transporter.sendMail(mailOptions2,(err,data)=>{
        if(err){ 
            return res.status(201).json({
              status:'success',
              user
          })
        }else{
            console.log(data)
        }
    })
      }catch(err){
          return res.status(201).json({
             status:'success',
             user
         })
       }
       res.status(201).json({
         status:'success',
         user
     })
     }
     
 })

exports.allOrders = catchAsync(async(req,res,next)=>{
    const userID = req.body.ID;
    const currentUser = req.user;
    console.log('this is current user',currentUser)
    let users;
    if(userID === undefined || userID === "" || userID === " "){
        users = await User.find().populate({
            path:'orderedProducts',
            select:'-__v -password -confirmPassword  -passwordResetToken -passwordResetExpires'
        })}else if( userID !== undefined && userID !== "" && userID !== " "){
            if(userID === 'LoggedInUser'){
                users = await User.find( {_id: currentUser._id} ).populate({
                    path:'orderedProducts',
                    select:'-__v -password -confirmPassword  -passwordResetToken -passwordResetExpires'
            })
            }else{
            users = await User.find( {_id:userID} ).populate({
                path:'orderedProducts',
                select:'-__v -password -confirmPassword  -passwordResetToken -passwordResetExpires'
                 })
            }
       }
  console.log(users)
     if(!users){
         return new AppError('cannot get any order',204)
     }
     res.status(201).json({
         status:'success',
         currentUser,
         users
        
     })
 })
 
exports.updateOrdersList = catchAsync(async(req,res,next)=>{


    let productIDs= [...req.body.productList]
   console.log(productIDs)

     const user = await User.findByIdAndUpdate(req.body.userID, {orderedProducts: productIDs} ,  {useFindAndModify: false }).populate({
        path:'orderedProducts',
        select:'-__v -password -confirmPassword  -passwordResetToken -passwordResetExpires'
});
     if(!user){
         return new AppError('user didnot exist anymore',500)
     }
     res.status(201).json({
         status:'success',
         user
     })
 })

exports.changePassword = catchAsync(async(req,res,next)=>{
    console.log(req.body)
    const token = req.body.resetToken;
    const password =req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
const user = await User.findOne({passwordResetToken:hashedToken, passwordResetExpires:{$gt: Date.now()}})
console.log(Date.now())
console.log(user)
    if(!user){
        return next(new AppError('Token is invalid or expired', 400))
    }
        user.password = password;
        user.confirmPassword = confirmPassword;
        user.passwordResetToken= undefined;
        user.passwordResetExpires =undefined;
        await user.save()// we haven't turned of validation bcz we want to validate confirm password and other validation by save middleware
    
    createSendToken(res,user,200);

 })


