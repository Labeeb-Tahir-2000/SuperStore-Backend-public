module.exports = (err,req,res,next) =>{
// this is global error handler middleware function that wiil call on every 'next(err)' 
// for example called by catchAsync function without statuse and error code but when called by AppError class which is extended by Error class 
// this class will give error code and statuse by making instance of it and calling its constructors.
    err.message = err.message;
    err.status = err.status  || 'error';
    err.statusCode = err.statusCode || 500;
    console.log(err.status, err.statusCode ," ",err.message);
    res.status(err.statusCode).json({
        status:err.status,
         message:err.message
    })
}
