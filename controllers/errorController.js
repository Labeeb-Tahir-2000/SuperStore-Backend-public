const AppError = require("../utilits/appError")

handleJWTError=()=>{ // making instance of Error class with better error message that instance will be returned to be used in error responce to send
  return new AppError('Invalid Token! please Log in again ', 401)
}

handleJWTExpireError=()=>{ // making instance of Error class with better error message that instance will be returned to be used in error responce to send
    return new AppError('Token has Expired! please Log in again ', 401)
}

sendDevError =(err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
         message:err.message,
         stack: err.stack,
    })
}
sendProError=(err,res)=>{
    if(err.isOperational){//validation or other errors except programming errors e.g server error,validation, connection etc so send less info to user
        res.status(err.statusCode).json({
            status:err.status,
             message:err.message,
        })
    }
    else{
        console.log(err);
        res.status(500).json({ // pogramming errors so console them
            status:err.status,
             message:err.message,
    });}
    }


module.exports = (err,req,res,next) =>{
// this is global error handler middleware function that wiil call on every 'next(err)' 
// for example called by catchAsync function without statuse and error code but when called by AppError class which is extended by Error class 
// this class will give error code and statuse by making instance of it and calling its constructors.
    err.message = err.message;
    err.status = err.status  || 'error';
    err.statusCode = err.statusCode || 500;
    console.log(err.status, err.statusCode ," ",err.message);

    const error = {...err}; // hard copying of err object

    if(process.env.NODE_ENVOIRMENT === 'development'){
        sendDevError(error,res);
    }

    if(process.env.NODE_ENVOIRMENT === 'production'){
        if(error.name === 'JsonWebTokenError') error = handleJWTError(error); //caling function that will return instance of Error class
        if(error.name === 'TokenExpiredError') error = handleJWTExpireError(error);
        sendproError(error,res);
    }
}
